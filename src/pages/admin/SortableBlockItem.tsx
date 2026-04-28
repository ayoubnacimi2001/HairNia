import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Settings2, GripVertical } from 'lucide-react';
import { PageBlock } from '../../store/useBuilderStore';

export function SortableBlockItem({ block, isActive, onClick }: { block: PageBlock, isActive: boolean, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} onClick={onClick} className={`p-3 border cursor-pointer transition-colors flex items-center gap-3 ${isActive ? 'border-primary-400 bg-primary-400/5' : 'border-[var(--border)] bg-[var(--background)] hover:border-white/20'}`}>
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing opacity-40 hover:opacity-100 transition-opacity p-1">
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="flex-1 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest">{block.type}</span>
        <Settings2 className="w-4 h-4 opacity-40" />
      </div>
    </div>
  );
}