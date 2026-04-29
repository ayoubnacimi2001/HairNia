import { ArrowLeft, Monitor, Smartphone, Tablet, Plus, Save, Type, Image as ImageIcon, LayoutTemplate, Trash2, AlignLeft, AlignCenter, AlignRight, ChevronsLeftRight, ChevronsRightLeft, Undo2, Redo2, Columns, Table, Grid3X3, TextSelect, Calendar, HelpCircle } from 'lucide-react';
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
  const { blocks, setBlocks, activeBlockId, deviceView, setDeviceView, setActiveBlock, addBlock, removeBlock, reorderBlocks, updateBlockProps, updateBlockStyles, undo, redo, past, future } = useBuilderStore();
  const [isSaving, setIsSaving] = useState(false);
  const [pageTitle, setPageTitle] = useState('Loading...');

  const activeBlock = blocks?.find(b => b.id === activeBlockId);

  // Setup drag sensors for mouse and keyboard accessibility
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Global Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl on Windows/Linux or Cmd on Mac
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          redo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

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
          <div className="text-[10px] uppercase tracking-widest font-bold opacity-60 line-clamp-1 flex-1 text-center px-2"><span>{pageTitle}</span></div>
          <div className="flex items-center gap-1">
            <button onClick={undo} disabled={!past?.length} className="p-2 text-[var(--foreground)]/60 hover:text-primary-400 hover:bg-[var(--background)] rounded-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Annuler (Ctrl+Z)">
              <Undo2 className="w-4 h-4" />
            </button>
            <button onClick={redo} disabled={!future?.length} className="p-2 text-[var(--foreground)]/60 hover:text-primary-400 hover:bg-[var(--background)] rounded-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Rétablir (Ctrl+Y)">
              <Redo2 className="w-4 h-4" />
            </button>
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
            <button onClick={() => addBlock('pricingTable')} className="flex flex-col items-center justify-center gap-1 p-2 bg-[var(--background)] border border-[var(--border)] hover:border-primary-400 transition-colors text-[9px] uppercase tracking-widest">
              <Table className="w-4 h-4 opacity-60" /> Pricing
            </button>
            <button onClick={() => addBlock('prelineProductGrid')} className="flex flex-col items-center justify-center gap-1 p-2 bg-[var(--background)] border border-[var(--border)] hover:border-primary-400 transition-colors text-[9px] uppercase tracking-widest">
              <Grid3X3 className="w-4 h-4 opacity-60" /> Preline Grid
            </button>
            <button onClick={() => addBlock('prelineStory')} className="flex flex-col items-center justify-center gap-1 p-2 bg-[var(--background)] border border-[var(--border)] hover:border-primary-400 transition-colors text-[9px] uppercase tracking-widest">
              <TextSelect className="w-4 h-4 opacity-60" /> Preline Story
            </button>
            <button onClick={() => addBlock('dateRange')} className="flex flex-col items-center justify-center gap-1 p-2 bg-[var(--background)] border border-[var(--border)] hover:border-primary-400 transition-colors text-[9px] uppercase tracking-widest">
              <Calendar className="w-4 h-4 opacity-60" /> Date Range
            </button>
            <button onClick={() => addBlock('faqGrid')} className="flex flex-col items-center justify-center gap-1 p-2 bg-[var(--background)] border border-[var(--border)] hover:border-primary-400 transition-colors text-[9px] uppercase tracking-widest">
              <HelpCircle className="w-4 h-4 opacity-60" /> FAQ Grid
            </button>
          </div>

          {/* Dnd-Kit Sortable List */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks?.map(b => b.id) || []} strategy={verticalListSortingStrategy}>
              <div className="space-y-3 mb-8">
                {(!blocks || blocks.length === 0) && (
                  <div className="text-center p-8 border border-dashed border-[var(--border)] text-[10px] uppercase tracking-widest opacity-40">
                    No blocks added yet
                  </div>
                )}
                {blocks?.map(block => (
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
              <h2 className="text-[11px] uppercase tracking-widest font-bold mb-4 text-primary-400"><span>Edit: {activeBlock.type}</span></h2>
              
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
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">URL de l'image de fond</label>
                      <input type="url" value={activeBlock.props.bgImageUrl || ''} onChange={(e) => updateBlockProps(activeBlock.id, { bgImageUrl: e.target.value })} placeholder="https://..." className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Texte du bouton</label>
                      <input type="text" value={activeBlock.props.buttonText || ''} onChange={(e) => updateBlockProps(activeBlock.id, { buttonText: e.target.value })} placeholder="ex: Shop Now" className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Lien du bouton</label>
                      <input type="text" value={activeBlock.props.buttonUrl || ''} onChange={(e) => updateBlockProps(activeBlock.id, { buttonUrl: e.target.value })} placeholder="/shop" className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
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
                {activeBlock.type === 'textSplit' && (
                  <>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Title</label>
                      <input type="text" value={activeBlock.props.title || ''} onChange={(e) => updateBlockProps(activeBlock.id, { title: e.target.value })} className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Content</label>
                      <textarea value={activeBlock.props.content || ''} onChange={(e) => updateBlockProps(activeBlock.id, { content: e.target.value })} className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] h-24 resize-none focus:border-primary-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Image URL</label>
                      <input type="url" value={activeBlock.props.imageUrl || ''} onChange={(e) => updateBlockProps(activeBlock.id, { imageUrl: e.target.value })} className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
                    </div>
                  </>
                )}
                {activeBlock.type === 'featureGrid' && (
                  <div className="space-y-2">
                    {activeBlock.props.features?.map((feat: any, index: number) => (
                      <div key={index} className="p-3 bg-[var(--background)] border border-[var(--border)] space-y-2">
                        <input type="text" value={feat.title || ''} onChange={(e) => {
                          const newFeatures = [...activeBlock.props.features];
                          newFeatures[index] = { ...newFeatures[index], title: e.target.value };
                          updateBlockProps(activeBlock.id, { features: newFeatures });
                        }} placeholder="Feature Title" className="w-full bg-[var(--card)] border border-[var(--border)] p-2 text-[10px] focus:border-primary-400 outline-none" />
                        <textarea value={feat.description || ''} onChange={(e) => {
                          const newFeatures = [...activeBlock.props.features];
                          newFeatures[index] = { ...newFeatures[index], description: e.target.value };
                          updateBlockProps(activeBlock.id, { features: newFeatures });
                        }} placeholder="Feature Description" className="w-full bg-[var(--card)] border border-[var(--border)] p-2 text-[10px] h-16 resize-none focus:border-primary-400 outline-none" />
                      </div>
                    ))}
                  </div>
                )}
                {['accordion', 'faqGrid'].includes(activeBlock.type) && (
                  <div className="space-y-4">
                    {activeBlock.type === 'faqGrid' && (
                      <>
                        <div>
                          <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Title</label>
                          <input type="text" value={activeBlock.props.title || ''} onChange={(e) => updateBlockProps(activeBlock.id, { title: e.target.value })} className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">URL de l'image de fond</label>
                          <input type="url" value={activeBlock.props.bgImageUrl || ''} onChange={(e) => updateBlockProps(activeBlock.id, { bgImageUrl: e.target.value })} placeholder="https://..." className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
                        </div>
                      </>
                    )}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] uppercase tracking-widest opacity-80">Questions</label>
                        <button type="button" onClick={() => updateBlockProps(activeBlock.id, { items: [...(activeBlock.props.items || []), { question: 'New Question?', answer: 'Answer here.' }] })} className="text-primary-400 text-[9px] uppercase tracking-widest hover:underline">+ Add</button>
                      </div>
                      {activeBlock.props.items?.map((item: any, index: number) => (
                        <div key={index} className="p-3 bg-[var(--background)] border border-[var(--border)] space-y-2 relative">
                          <button type="button" onClick={() => {
                            const newItems = activeBlock.props.items.filter((_: any, i: number) => i !== index);
                            updateBlockProps(activeBlock.id, { items: newItems });
                          }} className="absolute top-2 right-2 text-red-500 opacity-50 hover:opacity-100"><Trash2 className="w-3 h-3" /></button>
                          <input type="text" value={item.question || ''} onChange={(e) => {
                            const newItems = [...activeBlock.props.items];
                            newItems[index] = { ...newItems[index], question: e.target.value };
                            updateBlockProps(activeBlock.id, { items: newItems });
                          }} placeholder="Question" className="w-full bg-[var(--card)] border border-[var(--border)] p-2 pr-6 text-[10px] focus:border-primary-400 outline-none" />
                          <textarea value={item.answer || ''} onChange={(e) => {
                            const newItems = [...activeBlock.props.items];
                            newItems[index] = { ...newItems[index], answer: e.target.value };
                            updateBlockProps(activeBlock.id, { items: newItems });
                          }} placeholder="Answer" className="w-full bg-[var(--card)] border border-[var(--border)] p-2 text-[10px] h-16 resize-none focus:border-primary-400 outline-none" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeBlock.type === 'testimonials' && (
                  <div className="space-y-2">
                    {activeBlock.props.reviews?.map((rev: any, index: number) => (
                      <div key={index} className="p-3 bg-[var(--background)] border border-[var(--border)] space-y-2">
                        <input type="text" value={rev.name || ''} onChange={(e) => {
                          const newReviews = [...activeBlock.props.reviews];
                          newReviews[index] = { ...newReviews[index], name: e.target.value };
                          updateBlockProps(activeBlock.id, { reviews: newReviews });
                        }} placeholder="Reviewer Name" className="w-full bg-[var(--card)] border border-[var(--border)] p-2 text-[10px] focus:border-primary-400 outline-none" />
                        <input type="text" value={rev.role || ''} onChange={(e) => {
                          const newReviews = [...activeBlock.props.reviews];
                          newReviews[index] = { ...newReviews[index], role: e.target.value };
                          updateBlockProps(activeBlock.id, { reviews: newReviews });
                        }} placeholder="Reviewer Role" className="w-full bg-[var(--card)] border border-[var(--border)] p-2 text-[10px] focus:border-primary-400 outline-none" />
                        <textarea value={rev.text || ''} onChange={(e) => {
                          const newReviews = [...activeBlock.props.reviews];
                          newReviews[index] = { ...newReviews[index], text: e.target.value };
                          updateBlockProps(activeBlock.id, { reviews: newReviews });
                        }} placeholder="Review Text" className="w-full bg-[var(--card)] border border-[var(--border)] p-2 text-[10px] h-16 resize-none focus:border-primary-400 outline-none" />
                      </div>
                    ))}
                  </div>
                )}
                {activeBlock.type === 'dynamicForm' && (
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
                {activeBlock.type === 'pricingTable' && (
                  <>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Title</label>
                      <input type="text" value={activeBlock.props.title || ''} onChange={(e) => updateBlockProps(activeBlock.id, { title: e.target.value })} className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Subtitle</label>
                      <input type="text" value={activeBlock.props.subtitle || ''} onChange={(e) => updateBlockProps(activeBlock.id, { subtitle: e.target.value })} className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
                    </div>
                    <div className="space-y-2 mt-4">
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Tiers</label>
                      {activeBlock.props.tiers?.map((tier: any, index: number) => (
                        <div key={index} className="p-3 bg-[var(--background)] border border-[var(--border)] space-y-2">
                          <input type="text" value={tier.name || ''} onChange={(e) => {
                            const newTiers = [...activeBlock.props.tiers];
                            newTiers[index] = { ...newTiers[index], name: e.target.value };
                            updateBlockProps(activeBlock.id, { tiers: newTiers });
                          }} placeholder="Nom du plan" className="w-full bg-[var(--card)] border border-[var(--border)] p-2 text-[10px] focus:border-primary-400 outline-none" />
                          <div className="flex gap-2">
                            <input type="text" value={tier.price || ''} onChange={(e) => {
                              const newTiers = [...activeBlock.props.tiers];
                              newTiers[index] = { ...newTiers[index], price: e.target.value };
                              updateBlockProps(activeBlock.id, { tiers: newTiers });
                            }} placeholder="Prix" className="w-1/2 bg-[var(--card)] border border-[var(--border)] p-2 text-[10px] focus:border-primary-400 outline-none" />
                            <input type="text" value={tier.period || ''} onChange={(e) => {
                              const newTiers = [...activeBlock.props.tiers];
                              newTiers[index] = { ...newTiers[index], period: e.target.value };
                              updateBlockProps(activeBlock.id, { tiers: newTiers });
                            }} placeholder="Période (ex: / Mois)" className="w-1/2 bg-[var(--card)] border border-[var(--border)] p-2 text-[10px] focus:border-primary-400 outline-none" />
                          </div>
                          <input type="text" value={tier.features?.join(', ') || ''} onChange={(e) => {
                            const newTiers = [...activeBlock.props.tiers];
                            newTiers[index] = { ...newTiers[index], features: e.target.value.split(',').map((f: string) => f.trim()) };
                            updateBlockProps(activeBlock.id, { tiers: newTiers });
                          }} placeholder="Fonctionnalités (séparées par virgule)" className="w-full bg-[var(--card)] border border-[var(--border)] p-2 text-[10px] focus:border-primary-400 outline-none" />
                          <input type="text" value={tier.buttonText || ''} onChange={(e) => {
                            const newTiers = [...activeBlock.props.tiers];
                            newTiers[index] = { ...newTiers[index], buttonText: e.target.value };
                            updateBlockProps(activeBlock.id, { tiers: newTiers });
                          }} placeholder="Texte du bouton" className="w-full bg-[var(--card)] border border-[var(--border)] p-2 text-[10px] focus:border-primary-400 outline-none" />
                          <input type="text" value={tier.buttonUrl || ''} onChange={(e) => {
                            const newTiers = [...activeBlock.props.tiers];
                            newTiers[index] = { ...newTiers[index], buttonUrl: e.target.value };
                            updateBlockProps(activeBlock.id, { tiers: newTiers });
                          }} placeholder="Lien du bouton" className="w-full bg-[var(--card)] border border-[var(--border)] p-2 text-[10px] focus:border-primary-400 outline-none" />
                          <label className="flex items-center gap-2 text-[10px] uppercase cursor-pointer">
                            <input type="checkbox" checked={tier.isPopular || false} onChange={(e) => {
                              const newTiers = [...activeBlock.props.tiers];
                              newTiers[index] = { ...newTiers[index], isPopular: e.target.checked };
                              updateBlockProps(activeBlock.id, { tiers: newTiers });
                            }} /> Marquer comme Populaire
                          </label>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {activeBlock.type === 'prelineProductGrid' && (
                  <>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Title</label>
                      <input type="text" value={activeBlock.props.title || ''} onChange={(e) => updateBlockProps(activeBlock.id, { title: e.target.value })} className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Button URL (For Buy Now)</label>
                      <input type="text" value={activeBlock.props.buttonUrl || ''} onChange={(e) => updateBlockProps(activeBlock.id, { buttonUrl: e.target.value })} className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
                    </div>
                    <div className="space-y-2 mt-4">
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Products Array</label>
                      {activeBlock.props.products?.map((prod: any, index: number) => (
                        <div key={index} className="p-3 bg-[var(--background)] border border-[var(--border)] space-y-2">
                          <input type="text" value={prod.name || ''} onChange={(e) => {
                            const newProds = [...activeBlock.props.products];
                            newProds[index] = { ...newProds[index], name: e.target.value };
                            updateBlockProps(activeBlock.id, { products: newProds });
                          }} placeholder="Product Name" className="w-full bg-[var(--card)] border border-[var(--border)] p-2 text-[10px] focus:border-primary-400 outline-none" />
                          <div className="flex gap-2">
                            <input type="text" value={prod.price || ''} onChange={(e) => {
                              const newProds = [...activeBlock.props.products];
                              newProds[index] = { ...newProds[index], price: e.target.value };
                              updateBlockProps(activeBlock.id, { products: newProds });
                            }} placeholder="Price" className="w-1/2 bg-[var(--card)] border border-[var(--border)] p-2 text-[10px] focus:border-primary-400 outline-none" />
                            <input type="text" value={prod.origin || ''} onChange={(e) => {
                              const newProds = [...activeBlock.props.products];
                              newProds[index] = { ...newProds[index], origin: e.target.value };
                              updateBlockProps(activeBlock.id, { products: newProds });
                            }} placeholder="Origin" className="w-1/2 bg-[var(--card)] border border-[var(--border)] p-2 text-[10px] focus:border-primary-400 outline-none" />
                          </div>
                          <input type="text" value={prod.notes || ''} onChange={(e) => {
                            const newProds = [...activeBlock.props.products];
                            newProds[index] = { ...newProds[index], notes: e.target.value };
                            updateBlockProps(activeBlock.id, { products: newProds });
                          }} placeholder="Tasting Notes" className="w-full bg-[var(--card)] border border-[var(--border)] p-2 text-[10px] focus:border-primary-400 outline-none" />
                          <input type="text" value={prod.image || ''} onChange={(e) => {
                            const newProds = [...activeBlock.props.products];
                            newProds[index] = { ...newProds[index], image: e.target.value };
                            updateBlockProps(activeBlock.id, { products: newProds });
                          }} placeholder="Image URL" className="w-full bg-[var(--card)] border border-[var(--border)] p-2 text-[10px] focus:border-primary-400 outline-none" />
                          <input type="text" value={prod.buttonUrl || ''} onChange={(e) => {
                            const newProds = [...activeBlock.props.products];
                            newProds[index] = { ...newProds[index], buttonUrl: e.target.value };
                            updateBlockProps(activeBlock.id, { products: newProds });
                          }} placeholder="Lien du bouton (URL)" className="w-full bg-[var(--card)] border border-[var(--border)] p-2 text-[10px] focus:border-primary-400 outline-none" />
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {activeBlock.type === 'dateRange' && (
                  <>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Title</label>
                      <input type="text" value={activeBlock.props.title || ''} onChange={(e) => updateBlockProps(activeBlock.id, { title: e.target.value })} className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Subtitle</label>
                      <input type="text" value={activeBlock.props.subtitle || ''} onChange={(e) => updateBlockProps(activeBlock.id, { subtitle: e.target.value })} className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">URL de l'image de fond</label>
                      <input type="url" value={activeBlock.props.bgImageUrl || ''} onChange={(e) => updateBlockProps(activeBlock.id, { bgImageUrl: e.target.value })} placeholder="https://..." className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Texte du bouton</label>
                      <input type="text" value={activeBlock.props.buttonText || ''} onChange={(e) => updateBlockProps(activeBlock.id, { buttonText: e.target.value })} placeholder="Confirmer" className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Lien du bouton</label>
                      <input type="text" value={activeBlock.props.buttonUrl || ''} onChange={(e) => updateBlockProps(activeBlock.id, { buttonUrl: e.target.value })} placeholder="/checkout" className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
                    </div>
                  </>
                )}
                {activeBlock.type === 'prelineStory' && (
                  <>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Title</label>
                      <input type="text" value={activeBlock.props.title || ''} onChange={(e) => updateBlockProps(activeBlock.id, { title: e.target.value })} className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Description</label>
                      <textarea value={activeBlock.props.description || ''} onChange={(e) => updateBlockProps(activeBlock.id, { description: e.target.value })} className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] h-24 resize-none focus:border-primary-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Image URL</label>
                      <input type="url" value={activeBlock.props.imageUrl || ''} onChange={(e) => updateBlockProps(activeBlock.id, { imageUrl: e.target.value })} className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Button Text</label>
                      <input type="text" value={activeBlock.props.buttonText || ''} onChange={(e) => updateBlockProps(activeBlock.id, { buttonText: e.target.value })} className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Button URL</label>
                      <input type="text" value={activeBlock.props.buttonUrl || ''} onChange={(e) => updateBlockProps(activeBlock.id, { buttonUrl: e.target.value })} className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none" />
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
                <div>
                  <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Alignement du texte</label>
                  <div className="grid grid-cols-3 gap-1 bg-[var(--background)] border border-[var(--border)] p-1">
                    <button onClick={() => updateBlockStyles(activeBlock.id, { textAlign: 'left' })} className={`p-2 flex justify-center items-center transition-colors ${activeBlock.styles.textAlign === 'left' ? 'bg-primary-400 text-black' : 'hover:bg-white/5'}`}><AlignLeft className="w-4 h-4" /></button>
                    <button onClick={() => updateBlockStyles(activeBlock.id, { textAlign: 'center' })} className={`p-2 flex justify-center items-center transition-colors ${activeBlock.styles.textAlign === 'center' || !activeBlock.styles.textAlign ? 'bg-primary-400 text-black' : 'hover:bg-white/5'}`}><AlignCenter className="w-4 h-4" /></button>
                    <button onClick={() => updateBlockStyles(activeBlock.id, { textAlign: 'right' })} className={`p-2 flex justify-center items-center transition-colors ${activeBlock.styles.textAlign === 'right' ? 'bg-primary-400 text-black' : 'hover:bg-white/5'}`}><AlignRight className="w-4 h-4" /></button>
                  </div>
                </div>
                
                {['text', 'hero', 'testimonials', 'textSplit', 'accordion', 'featureGrid', 'prelineStory'].includes(activeBlock.type) && (
                  <div>
                    <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Taille du texte</label>
                    <select value={activeBlock.styles.fontSize || ''} onChange={(e) => updateBlockStyles(activeBlock.id, { fontSize: e.target.value })} className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] focus:border-primary-400 outline-none">
                      <option value="">Défaut</option>
                      <option value="12px">Petit (12px)</option>
                      <option value="14px">Normal (14px)</option>
                      <option value="16px">Moyen (16px)</option>
                      <option value="20px">Grand (20px)</option>
                      <option value="24px">Très Grand (24px)</option>
                    </select>
                  </div>
                )}
                
                {['image', 'textSplit', 'prelineStory'].includes(activeBlock.type) && (
                  <div>
                    <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80"><span>Taille de l'image ({activeBlock.styles.width || '100%'})</span></label>
                    <input type="range" min="10" max="100" value={parseInt(activeBlock.styles.width || '100')} onChange={(e) => updateBlockStyles(activeBlock.id, { width: `${e.target.value}%` })} className="w-full accent-primary-400" />
                  </div>
                )}
                {['textSplit', 'prelineStory'].includes(activeBlock.type) && (
                  <div>
                    <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Disposition</label>
                    <div className="grid grid-cols-2 gap-1 bg-[var(--background)] border border-[var(--border)] p-1">
                      <button 
                        onClick={() => updateBlockStyles(activeBlock.id, { flexDirection: 'row-reverse' })} 
                        className={`p-2 flex justify-center items-center gap-2 text-[9px] uppercase tracking-widest transition-colors ${
                          activeBlock.styles.flexDirection === 'row-reverse' ? 'bg-primary-400 text-black' : 'hover:bg-white/5'
                        }`}
                      >
                        <ChevronsLeftRight className="w-4 h-4" /> Image à gauche
                      </button>
                      <button 
                        onClick={() => updateBlockStyles(activeBlock.id, { flexDirection: 'row' })} 
                        className={`p-2 flex justify-center items-center gap-2 text-[9px] uppercase tracking-widest transition-colors ${
                          activeBlock.styles.flexDirection === 'row' || !activeBlock.styles.flexDirection ? 'bg-primary-400 text-black' : 'hover:bg-white/5'
                        }`}
                      >
                        <ChevronsRightLeft className="w-4 h-4" /> Image à droite
                      </button>
                    </div>
                  </div>
                )}
                
                {['hero', 'dateRange', 'faqGrid'].includes(activeBlock.type) && (
                  <div>
                    <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80"><span>Opacité du calque d'image ({activeBlock.styles.bgOverlayOpacity || '0'})</span></label>
                    <input type="range" min="0" max="1" step="0.1" value={activeBlock.styles.bgOverlayOpacity || 0} onChange={(e) => updateBlockStyles(activeBlock.id, { bgOverlayOpacity: parseFloat(e.target.value) })} className="w-full accent-primary-400" />
                  </div>
                )}
                
                {['pricingTable', 'prelineProductGrid'].includes(activeBlock.type) && (
                  <div>
                    <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Couleur de fond des cartes</label>
                    <input type="text" value={activeBlock.styles.cardBgColor || ''} onChange={(e) => updateBlockStyles(activeBlock.id, { cardBgColor: e.target.value })} placeholder="ex: #ffffff, transparent, ou rgba(0,0,0,0.5)" className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] font-mono focus:border-primary-400 outline-none" />
                  </div>
                )}
                
                {['hero', 'pricingTable', 'prelineProductGrid', 'prelineStory', 'dateRange'].includes(activeBlock.type) && (
                  <>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Couleur du bouton</label>
                      <input type="text" value={activeBlock.styles.buttonBgColor || ''} onChange={(e) => updateBlockStyles(activeBlock.id, { buttonBgColor: e.target.value })} placeholder="ex: var(--theme-primary) ou #d4af37" className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] font-mono focus:border-primary-400 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] mb-1 uppercase tracking-widest opacity-80">Couleur du texte du bouton</label>
                      <input type="text" value={activeBlock.styles.buttonTextColor || ''} onChange={(e) => updateBlockStyles(activeBlock.id, { buttonTextColor: e.target.value })} placeholder="ex: #000000" className="w-full bg-[var(--background)] border border-[var(--border)] p-2 text-[11px] font-mono focus:border-primary-400 outline-none" />
                    </div>
                  </>
                )}
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
            {(!blocks || blocks.length === 0) ? (
              <div className="flex flex-col items-center justify-center h-[800px] text-[10px] uppercase tracking-widest opacity-40 text-center p-10">
                Aucun bloc n'a été ajouté.<br/>Utilisez la barre latérale pour ajouter votre premier bloc.
              </div>
            ) : (
              <div className="flex flex-col w-full min-h-full">
                {blocks?.map(block => <BlockRenderer key={block.id} block={block} />)}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}