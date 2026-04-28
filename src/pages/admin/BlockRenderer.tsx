import { PageBlock } from '../../store/useBuilderStore';

export function BlockRenderer({ block }: { block: PageBlock }) {
  const { type, props, styles } = block;

  switch (type) {
    case 'hero':
      return (
        <div style={styles} className="flex flex-col items-center justify-center text-center w-full">
          <h1 className="text-4xl md:text-6xl font-serif italic mb-4">{props.title || 'Hero Title'}</h1>
          <p className="opacity-80 text-sm">{props.subtitle || 'Hero subtitle goes here'}</p>
        </div>
      );
    case 'text':
      return (
        <div style={styles} className="w-full">
          <p className="text-[13px] leading-relaxed">{props.content || 'Enter your text here...'}</p>
        </div>
      );
    case 'image':
      return (
        <div style={styles} className="w-full flex justify-center">
          {props.imageUrl ? (
            <img src={props.imageUrl} alt={props.altText || 'Block image'} className="max-w-full h-auto object-cover border border-[var(--border)]" />
          ) : (
            <div className="w-full h-64 bg-white/5 flex items-center justify-center border border-[var(--border)] text-[10px] uppercase tracking-widest opacity-40">
              No Image Selected
            </div>
          )}
        </div>
      );
    case 'featureGrid':
      return (
        <div style={styles} className="w-full max-w-6xl mx-auto py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" style={{ gridTemplateColumns: `repeat(${props.columns || 3}, minmax(0, 1fr))` }}>
            {props.features?.map((feat: any, i: number) => (
              <div key={i} className="flex flex-col gap-2">
                <h3 className="text-lg font-bold">{feat.title}</h3>
                <p className="text-[13px] opacity-70 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case 'accordion':
      return (
        <div style={styles} className="w-full max-w-3xl mx-auto space-y-4 py-8">
          {props.items?.map((item: any, i: number) => (
            <details key={i} className="group border border-[var(--border)] bg-[var(--background)] p-4 cursor-pointer">
              <summary className="font-bold uppercase tracking-widest text-[11px] list-none flex justify-between items-center outline-none">
                {item.question}
                <span className="transition group-open:rotate-180 opacity-50">▼</span>
              </summary>
              <p className="mt-4 text-[12px] opacity-70 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      );
    case 'textSplit':
      return (
        <div style={styles} className="w-full flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto py-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-3xl font-serif italic">{props.title}</h2>
            <p className="text-[13px] opacity-70 leading-relaxed">{props.content}</p>
          </div>
          {props.imageUrl && (
            <div className="flex-1">
              <img src={props.imageUrl} alt={props.title} className="w-full h-auto object-cover border border-[var(--border)]" />
            </div>
          )}
        </div>
      );
    case 'testimonials':
      return (
        <div style={styles} className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto py-8">
          {props.reviews?.map((rev: any, i: number) => (
            <div key={i} className="p-6 border border-[var(--border)] bg-[var(--background)] flex flex-col gap-4">
              <p className="italic text-[13px] opacity-80 leading-relaxed">"{rev.text}"</p>
              <div className="mt-auto pt-4 border-t border-[var(--border)]">
                <p className="font-bold text-[11px] uppercase tracking-widest">{rev.name}</p>
                <p className="text-[9px] uppercase tracking-widest opacity-50">{rev.role}</p>
              </div>
            </div>
          ))}
        </div>
      );
    case 'dynamicForm':
      return (
        <div style={styles} className="w-full max-w-2xl mx-auto text-center border border-dashed border-[var(--border)] p-8 bg-[var(--card)] my-8">
          <h2 className="text-2xl font-serif italic mb-2">{props.title}</h2>
          <p className="text-[11px] uppercase tracking-widest opacity-60 mb-6">{props.subtitle}</p>
          <div className="text-[9px] uppercase tracking-widest text-primary-400 bg-primary-400/10 py-4 px-4">
            [ Dynamic Form Area: Renders natively on the live site ]
          </div>
        </div>
      );
    default:
      return (
        <div style={styles} className="p-8 border border-dashed border-[var(--border)] opacity-50 text-center text-[10px] uppercase tracking-widest w-full">
          Unknown block type: {type}
        </div>
      );
  }
}