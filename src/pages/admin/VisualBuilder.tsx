import { ArrowLeft, Monitor, Smartphone, Tablet, Plus, Save, Type, Image as ImageIcon, LayoutTemplate, Trash2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useBuilderStore } from '../../store/useBuilderStore';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableBlockItem } from './SortableBlockItem';
import { BlockRenderer } from './BlockRenderer';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export function VisualBuilder() {
  const { pageId } = useParams();
  const { blocks, setBlocks, activeBlockId, deviceView, setDeviceView, setActiveBlock, addBlock, removeBlock, reorderBlocks, updateBlockProps, updateBlockStyles } = useBuilderStore();
  const [isSaving, setIsSaving] = useState(false);
  const [pageTitle, setPageTitle] = useState('Loading...');

  const activeBlock = blocks.find(b => b.id === activeBlockId);

  // Setup drag sensors for mouse and keyboard accessibility
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const loadPageData = async () => {
      if (!pageId) return;
      const docRef = doc(db, 'pages', pageId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setPageTitle(data.title || 'Untitled Page');
        // Load blocks if they exist, otherwise start fresh
        setBlocks(data.visualBlocks || []);
      }
    };
    loadPageData();
  }, [pageId, setBlocks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      const newIndex = blocks.findIndex((block) => block.id === over.id);
      reorderBlocks(oldIndex, newIndex);
    }
  };

  // Dynamically set the canvas width based on the selected device
  const getCanvasWidth = () => {
    switch (deviceView) {
      case 'mobile': return 'max-w-[375px]';
      case 'tablet': return 'max-w-[768px]';
      case 'desktop': return 'max-w-[1200px]';
      default: return 'max-w-[1200px]';
    }
  };

  const handleSavePage = async () => {
    if (!pageId) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'pages', pageId), {
        visualBlocks: blocks,
        updatedAt: serverTimestamp()
      });
      alert('Visual Layout Saved Successfully!');
    } catch (error) {
      console.error('Failed to save visual blocks:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[var(--background)] overflow-hidden font-sans">
      
      {/* =========================================
          LEFT SIDEBAR: CONTROLS & SETTINGS
      ========================================= */}
      <aside className="w-80 flex-shrink-0 border-r border-[var(--border)] bg-[var(--card)] flex flex-col h-full z-10 shadow-2xl">
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <Link to="/admin" className="p-2 hover:bg-[var(--background)] rounded-sm transition-colors text-[var(--foreground)]/60 hover:text-primary-400">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="text-[10px] uppercase tracking-widest font-bold opacity-60 line-clamp-1 flex-1 text-center px-2">{pageTitle}</div>
          <div className="flex items-center gap-1">
            {activeBlock && (
              <button onClick={() => {
                if(window.confirm('Delete this block?')) removeBlock(activeBlock.id);
              }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-sm transition-colors" title="Delete Active Block">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={handleSavePage} disabled={isSaving} className="p-2 bg-primary-400 text-black hover:opacity-90 rounded-sm transition-opacity disabled:opacity-50" title="Save Page Layout">
              {isSaving ? <span className="text-[10px] font-bold">...</span> : <Save className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Blocks List & Settings Area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-[11px] uppercase tracking-widest font-bold">Page Blocks</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button onClick={() => addBlock('hero')} className="flex flex-col items-center justify-center gap-1 p-2 bg-[var(--background)] border border-[var(--border)] hover:border-primary-400 transition-colors text-[9px] uppercase tracking-widest">
              <LayoutTemplate className="w-4 h-4 opacity-60" /> Hero
            </button>
            <button onClick={() => addBlock('text')} className="flex flex-col items-center justify-center gap-1 p-2 bg-[var(--background)] border border-[var(--border)] hover:border-primary-400 transition-colors text-[9px] uppercase tracking-widest">
              <Type className="w-4 h-4 opacity-60" /> Text
            </button>
            <button onClick={() => addBlock('image')} className="flex flex-col items-center justify-center gap-1 p-2 bg-[var(--background)] border border-[var(--border)] hover:border-primary-400 transition-colors text-[9px] uppercase tracking-widest">
              <ImageIcon className="w-4 h-4 opacity-60" /> Image
            </button>
          </div>

          {/* Dnd-Kit Sortable List */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3 mb-8">
                {blocks.length === 0 && (
                  <div className="text-center p-8 border border-dashed border-[var(--border)] text-[10px] uppercase tracking-widest opacity-40">
                    No blocks added yet
                  </div>
                )}
                {blocks.map(block => (
                  <SortableBlockItem 
                    key={block.id} 
                    block={block} 
                    isActive={activeBlockId === block.id} 
                    onClick={() => setActiveBlock(block.id)} 
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Active Block Editor (Props & Styles) */}
          {activeBlock && (
            <div className="border-t border-[var(--border)] pt-6 mt-6 animate-in fade-in">
              <h2 className="text-[11px] uppercase tracking-widest font-bold mb-4 text-primary-400">Edit: {activeBlock.type}</h2>
              
              {/* Props Editor */}
              <div className="space-y-4 mb-6">
                <h3 className="text-[9px] uppercase tracking-widest opacity-60 font-bold border-b border-[var(--border)] pb-2">Content</h3>
                
                {activeBlock.type === 'hero' && (
                  <>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Title</label>
                      <input type="text" value={activeBlock.props.title || ''} onChange={(e) => updateBlockProps(activeBlock.id, { title: e.target.value })} className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Subtitle</label>
                      <input type="text" value={activeBlock.props.subtitle || ''} onChange={(e) => updateBlockProps(activeBlock.id, { subtitle: e.target.value })} className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
                    </div>
                  </>
                )}
                {activeBlock.type === 'text' && (
                  <div>
                    <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Text Content</label>
                    <textarea value={activeBlock.props.content || ''} onChange={(e) => updateBlockProps(activeBlock.id, { content: e.target.value })} className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] h-32 resize-none focus:border-primary-400 outline-none" />
                  </div>
                )}
                {activeBlock.type === 'image' && (
                  <>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Image URL</label>
                      <input type="url" value={activeBlock.props.imageUrl || ''} onChange={(e) => updateBlockProps(activeBlock.id, { imageUrl: e.target.value })} className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Alt Text</label>
                      <input type="text" value={activeBlock.props.altText || ''} onChange={(e) => updateBlockProps(activeBlock.id, { altText: e.target.value })} className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
                    </div>
                  </>
                )}
              </div>

              {/* Styles Editor */}
              <div className="space-y-4">
                <h3 className="text-[9px] uppercase tracking-widest opacity-60 font-bold border-b border-[var(--border)] pb-2">Styles</h3>
                <div>
                  <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={activeBlock.styles.backgroundColor || '#000000'} onChange={(e) => updateBlockStyles(activeBlock.id, { backgroundColor: e.target.value })} className="w-8 h-8 border-0 p-0 cursor-pointer bg-transparent" />
                    <input type="text" value={activeBlock.styles.backgroundColor || 'transparent'} onChange={(e) => updateBlockStyles(activeBlock.id, { backgroundColor: e.target.value })} className="flex-1 bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] font-mono focus:border-primary-400 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Padding</label>
                  <input type="text" value={activeBlock.styles.padding || ''} onChange={(e) => updateBlockStyles(activeBlock.id, { padding: e.target.value })} placeholder="e.g. 4rem 1rem" className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] font-mono focus:border-primary-400 outline-none" />
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* =========================================
          RIGHT SIDE: PREVIEW CANVAS
      ========================================= */}
      <main className="flex-1 flex flex-col bg-black/40 relative">
        
        {/* Canvas Toolbar (Device Toggles) */}
        <div className="h-14 border-b border-[var(--border)] bg-[var(--card)] flex justify-center items-center gap-2">
          <button onClick={() => setDeviceView('desktop')} className={`p-2 transition-colors ${deviceView === 'desktop' ? 'text-primary-400' : 'text-[var(--foreground)]/40 hover:text-[var(--foreground)]'}`} title="Desktop View"><Monitor className="w-5 h-5" /></button>
          <button onClick={() => setDeviceView('tablet')} className={`p-2 transition-colors ${deviceView === 'tablet' ? 'text-primary-400' : 'text-[var(--foreground)]/40 hover:text-[var(--foreground)]'}`} title="Tablet View"><Tablet className="w-5 h-5" /></button>
          <button onClick={() => setDeviceView('mobile')} className={`p-2 transition-colors ${deviceView === 'mobile' ? 'text-primary-400' : 'text-[var(--foreground)]/40 hover:text-[var(--foreground)]'}`} title="Mobile View"><Smartphone className="w-5 h-5" /></button>
        </div>

        {/* The Actual Canvas Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center items-start overflow-x-hidden">
          <div className={`w-full bg-[var(--background)] min-h-[800px] shadow-2xl transition-all duration-500 ease-in-out border border-[var(--border)] ${getCanvasWidth()}`}>
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[800px] text-[10px] uppercase tracking-widest opacity-40 text-center p-10">
                Canvas Area<br/>Add a block to start building
              </div>
            ) : (
              <div className="flex flex-col w-full min-h-full">
                {blocks.map(block => <BlockRenderer key={block.id} block={block} />)}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}