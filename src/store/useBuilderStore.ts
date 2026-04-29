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
      props: type === 'pricingTable'
        ? {
            title: 'Simple, transparent pricing',
            subtitle: 'No Contracts. No surprise fees.',
            tiers: [
              { name: 'Casual', price: 'Free', period: '', buttonText: 'Start free', buttonUrl: '#', isPopular: false, features: ['Up to 5 projects', 'Up to 10 collaborators', '2Gb of storage'] },
              { name: 'Professional', price: '$24.90', period: '/month', buttonText: 'Start free trial', buttonUrl: '#', isPopular: true, features: ['Up to 10 projects', 'Up to 20 collaborators', '10Gb of storage', 'Real-time collaborations'] },
              { name: 'Expert', price: '$49.90', period: '/month', buttonText: 'Start free trial', buttonUrl: '#', isPopular: false, features: ['Unlimited projects', 'Unlimited collaborators', 'Unlimited storage', 'Real-time collaborations', '24x7 Support'] }
            ]
          }
        : type === 'prelineProductGrid'
        ? {
            title: 'New this season',
            buttonUrl: '/cart',
            products: [
              { name: 'Tokyo Roast', price: '$12.50', notes: 'Matcha, Vanilla, Milk Chocolate', origin: 'Japan', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80', buttonUrl: '#' },
              { name: 'Shibuya Blend', price: '$14.00', notes: 'Red Apple, Caramel, Almond', origin: 'Colombia', image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=600&q=80', buttonUrl: '#' },
              { name: 'Kyoto Drip', price: '$9.50', notes: 'Cherry Blossom, Honey, Pecan', origin: 'Japan', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80', buttonUrl: '#' }
            ]
          }
        : type === 'prelineStory'
        ? {
            title: 'A Family Tradition of Rich, Aromatic Coffee',
            description: 'Coffee has the power to connect generations—whether you\'re diving into your favorite manga or enjoying our expertly crafted blends inspired by the heart of Tokyo.',
            buttonText: 'Watch the Video',
            buttonUrl: '#',
            imageUrl: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=800&q=80'
          }
        : type === 'dateRange'
        ? {
            title: 'Book an Appointment',
            subtitle: 'Select your preferred date and time below.',
            buttonText: 'Confirm Booking',
            buttonUrl: '#',
            bgImageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=1200&q=80'
          }
        : type === 'faqGrid'
        ? {
            title: 'Frequently asked questions.',
            bgImageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=1200&q=80',
            items: [
              { question: 'What can I expect at my first consultation?', answer: 'Our experts will assess your needs and provide a tailored plan specifically for your styling preferences.' },
              { question: 'What are your opening hours?', answer: 'We are open Monday through Saturday from 9 AM to 8 PM, and Sundays from 10 AM to 5 PM.' },
              { question: 'Do I need an appointment?', answer: 'While walk-ins are welcome, we highly recommend booking an appointment to guarantee your preferred time.' },
              { question: 'What is your cancellation policy?', answer: 'We kindly request a 24-hour notice for any cancellations or rescheduling.' }
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