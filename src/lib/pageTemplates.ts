export const prelineSaleTemplate = [
  {
    id: "preline-hero-1",
    type: "hero",
    props: {
      title: "Bringing Art to Everything.",
      subtitle: "Experience the immersive world of Ayuzawa Coffee. Where Japanese culture and premium brewing meet.",
      buttonText: "Shop the Collection",
      buttonUrl: "/shop"
    },
    styles: { backgroundColor: "#ffffff", textColor: "#111827", textAlign: "left", padding: "py-20" }
  },
  {
    id: "preline-grid-1",
    type: "prelineProductGrid",
    props: {
      title: "New this season",
      buttonUrl: "/cart",
      products: [
        { name: "Tokyo Roast", price: "$12.50", notes: "Matcha, Vanilla, Milk Chocolate", origin: "Japan", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80" },
        { name: "Shibuya Blend", price: "$14.00", notes: "Red Apple, Caramel, Almond", origin: "Colombia", image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=600&q=80" },
        { name: "Kyoto Drip", price: "$9.50", notes: "Cherry Blossom, Honey, Pecan", origin: "Japan", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80" }
      ]
    },
    styles: { backgroundColor: "#f9fafb", padding: "py-16" }
  },
  {
    id: "preline-story-1",
    type: "prelineStory",
    props: {
      title: "A Family Tradition of Rich, Aromatic Coffee",
      description: "Coffee has the power to connect generations—whether you're diving into your favorite manga or enjoying our expertly crafted blends inspired by the heart of Tokyo.",
      buttonText: "Watch the Video",
      buttonUrl: "#",
      imageUrl: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=800&q=80"
    },
    styles: { backgroundColor: "#ffffff", padding: "py-16" }
  }
];

export function getPageTemplates() {
  return [
    {
      id: "preline-sale",
      name: "Preline Sales Template",
      description: "A minimalist, high-converting sales page layout.",
      blocks: prelineSaleTemplate
    }
  ];
}