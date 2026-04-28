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
  
  // History State
  past: PageBlock[][];
  future: PageBlock[][];
  
  // Actions
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
  setBlocks: (blocks: PageBlock[]) => void;
  addBlock: (type: string) => void;
  removeBlock: (id: string) => void;
  reorderBlocks: (startIndex: number, endIndex: number) => void;
  updateBlockProps: (id: string, props: Record<string, any>) => void;
  updateBlockStyles: (id: string, styles: Record<string, any>) => void;
  setActiveBlock: (id: string | null) => void;
  setDeviceView: (device: DeviceView) => void;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  blocks: [],
  activeBlockId: null,
  deviceView: 'desktop',

  past: [],
  future: [],

  saveHistory: () => {
    const { blocks, past } = get();
    // JSON parse/stringify is immune to Proxy errors
    const blocksDeepCopy = JSON.parse(JSON.stringify(blocks));
    
    const newPast = [...past, blocksDeepCopy];
    if (newPast.length > 15) {
      newPast.shift(); // Cap history at 15
    }

    set({ past: newPast, future: [] });
  },

  undo: () => {
    const { past, future, blocks } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    set({
      past: newPast,
      future: [JSON.parse(JSON.stringify(blocks)), ...future],
      blocks: JSON.parse(JSON.stringify(previous)),
    });
  },

  redo: () => {
    const { past, future, blocks } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    set({
      past: [...past, JSON.parse(JSON.stringify(blocks))],
      future: newFuture,
      blocks: JSON.parse(JSON.stringify(next)),
    });
  },

  setBlocks: (blocks) => set({ blocks, past: [], future: [] }),

  addBlock: (type) => {
    get().saveHistory();
    set((state) => {
    const newBlock: PageBlock = {
      id: `block-${crypto.randomUUID()}`, // Generate unique ID
      type,
      props: type === 'heroSplitImage' 
        ? { 
            title: 'Best place to choose your <br> <span class="text-blue-500">clothes</span>', 
            subtitle: 'Lorem ipsum dolor sit amet...', 
            imageUrl: 'https://merakiui.com/images/components/Catalogue-pana.svg',
            buttonText: 'Shop Now',
            buttonUrl: '#'
          }
        : type === 'pricingTable'
        ? {
            title: 'Simple, transparent pricing',
            subtitle: 'No Contracts. No surprise fees.',
            tiers: [
              { name: 'Intro', price: '$19', period: '/ Month', buttonText: 'Choose plan', buttonUrl: '#', isPopular: false },
              { name: 'Popular', price: '$99', period: '/ Month', buttonText: 'Choose plan', buttonUrl: '#', isPopular: true },
              { name: 'Enterprise', price: '$199', period: '/ Month', buttonText: 'Choose plan', buttonUrl: '#', isPopular: false }
            ]
          }
        : {},
      styles: { padding: '4rem 1rem', backgroundColor: 'transparent' } // Default styles
    };
    return { blocks: [...state.blocks, newBlock] };
    });
  },

  removeBlock: (id) => {
    get().saveHistory();
    set((state) => ({
      blocks: state.blocks.filter(block => block.id !== id),
      activeBlockId: state.activeBlockId === id ? null : state.activeBlockId
    }));
  },

  reorderBlocks: (startIndex, endIndex) => {
    get().saveHistory();
    set((state) => {
    const newBlocks = Array.from(state.blocks);
    const [movedBlock] = newBlocks.splice(startIndex, 1);
    newBlocks.splice(endIndex, 0, movedBlock);
    return { blocks: newBlocks };
    });
  },

  updateBlockProps: (id, newProps) => {
    get().saveHistory();
    set((state) => ({
      blocks: state.blocks.map(block => 
        block.id === id 
          ? { ...block, props: { ...block.props, ...newProps } }
          : block
      )
    }));
  },

  updateBlockStyles: (id, newStyles) => {
    get().saveHistory();
    set((state) => ({
      blocks: state.blocks.map(block => 
        block.id === id 
          ? { ...block, styles: { ...block.styles, ...newStyles } }
          : block
      )
    }));
  },

  setActiveBlock: (id) => set({ activeBlockId: id }),
  
  setDeviceView: (deviceView) => set({ deviceView })
}));