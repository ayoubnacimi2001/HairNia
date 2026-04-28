import { create } from 'zustand';

export interface PageBlock {
  id: string;
  type: string; // e.g., 'hero', 'featureGrid', 'faq', 'dynamicForm'
  props: Record<string, any>;
  styles: Record<string, any>;
}

export type DeviceView = 'desktop' | 'tablet' | 'mobile';

interface BuilderState {
  blocks: PageBlock[];
  activeBlockId: string | null;
  deviceView: DeviceView;
  
  // Actions
  setBlocks: (blocks: PageBlock[]) => void;
  addBlock: (type: string) => void;
  removeBlock: (id: string) => void;
  reorderBlocks: (startIndex: number, endIndex: number) => void;
  updateBlockProps: (id: string, props: Record<string, any>) => void;
  updateBlockStyles: (id: string, styles: Record<string, any>) => void;
  setActiveBlock: (id: string | null) => void;
  setDeviceView: (device: DeviceView) => void;
}

export const useBuilderStore = create<BuilderState>((set) => ({
  blocks: [],
  activeBlockId: null,
  deviceView: 'desktop',

  setBlocks: (blocks) => set({ blocks }),

  addBlock: (type) => set((state) => {
    const newBlock: PageBlock = {
      id: `block-${crypto.randomUUID()}`, // Generate unique ID
      type,
      props: {}, 
      styles: { padding: '4rem 1rem', backgroundColor: 'transparent' } // Default styles
    };
    return { blocks: [...state.blocks, newBlock] };
  }),

  removeBlock: (id) => set((state) => ({
    blocks: state.blocks.filter(block => block.id !== id),
    activeBlockId: state.activeBlockId === id ? null : state.activeBlockId
  })),

  reorderBlocks: (startIndex, endIndex) => set((state) => {
    const newBlocks = Array.from(state.blocks);
    const [movedBlock] = newBlocks.splice(startIndex, 1);
    newBlocks.splice(endIndex, 0, movedBlock);
    return { blocks: newBlocks };
  }),

  updateBlockProps: (id, newProps) => set((state) => ({
    blocks: state.blocks.map(block => 
      block.id === id 
        ? { ...block, props: { ...block.props, ...newProps } }
        : block
    )
  })),

  updateBlockStyles: (id, newStyles) => set((state) => ({
    blocks: state.blocks.map(block => 
      block.id === id 
        ? { ...block, styles: { ...block.styles, ...newStyles } }
        : block
    )
  })),

  setActiveBlock: (id) => set({ activeBlockId: id }),
  
  setDeviceView: (deviceView) => set({ deviceView })
}));