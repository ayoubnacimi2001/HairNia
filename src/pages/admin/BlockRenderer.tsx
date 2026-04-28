import { PageBlock } from '../../store/useBuilderStore';

const getAlignmentClasses = (align: string | undefined) => {
  switch (align) {
    case 'left': return 'text-left';
    case 'right': return 'text-right';
    case 'center':
    default:
      return 'text-center';
  }
};

const getJustifyContent = (align: string | undefined) => {
  switch (align) {
    case 'left': return 'flex-start';
    case 'right': return 'flex-end';
    case 'center':
    default: return 'center';
  }
};

const getAlignItems = (align: string | undefined) => {
  switch (align) {
    case 'left': return 'flex-start';
    case 'right': return 'flex-end';
    case 'center':
    default: return 'center';
  }
};

export function BlockRenderer({ block }: { block: PageBlock }) {
  const { type, props, styles = {} } = block;
  const { width, fontSize, ...containerStyles } = styles;

  switch (type) {
    case 'hero':
      return (
        <div style={{ ...containerStyles, alignItems: getAlignItems(styles.textAlign) }} className={`flex flex-col justify-center w-full ${getAlignmentClasses(styles.textAlign)}`}>
          <h1 className="text-4xl md:text-6xl font-serif italic mb-4">{props.title || 'Hero Title'}</h1>
          <p className="opacity-80" style={{ fontSize: fontSize || '14px' }}>{props.subtitle || 'Hero subtitle goes here'}</p>
        </div>
      );
    case 'text':
      return (
        <div style={{ ...containerStyles, justifyContent: getJustifyContent(styles.textAlign) }} className="w-full flex p-4">
          <div className={getAlignmentClasses(styles.textAlign)}>
            <p className="leading-relaxed" style={{ fontSize: fontSize || '13px' }}>{props.content || 'Enter your text here...'}</p>
          </div>
        </div>
      );
    case 'image':
      return (
        <div style={{ ...containerStyles, justifyContent: getJustifyContent(styles.textAlign) }} className="w-full flex">
          {props.imageUrl ? (
            <img src={props.imageUrl} alt={props.altText || 'Block image'} className="max-w-full h-auto object-cover border border-[var(--border)]" style={{ width: width || '100%' }} />
          ) : (
            <div className="h-64 bg-white/5 flex items-center justify-center border border-[var(--border)] text-[10px] uppercase tracking-widest opacity-40" style={{ width: width || '100%' }}>
              No Image Selected
            </div>
          )}
        </div>
      );
    case 'featureGrid':
      return (
        <div style={{ ...containerStyles, justifyContent: getJustifyContent(styles.textAlign) }} className="w-full flex py-8">
          <div className={`w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 ${getAlignmentClasses(styles.textAlign)}`} style={{ gridTemplateColumns: `repeat(${props.columns || 3}, minmax(0, 1fr))` }}>
            {props.features?.map((feat: any, i: number) => (
              <div key={i} className="flex flex-col gap-2">
                <h3 className="text-lg font-bold">{feat.title}</h3>
                <p className="opacity-70 leading-relaxed" style={{ fontSize: fontSize || '13px' }}>{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case 'accordion':
      return (
        <div style={{ ...containerStyles, justifyContent: getJustifyContent(styles.textAlign) }} className="w-full flex py-8">
          <div className={`w-full max-w-3xl space-y-4 ${getAlignmentClasses(styles.textAlign)}`}>
            {props.items?.map((item: any, i: number) => (
              <details key={i} className="group border border-[var(--border)] bg-[var(--background)] p-4 cursor-pointer text-left">
                <summary className="font-bold uppercase tracking-widest text-[11px] list-none flex justify-between items-center outline-none">
                  {item.question}
                  <span className="transition group-open:rotate-180 opacity-50">▼</span>
                </summary>
                <p className="mt-4 opacity-70 leading-relaxed" style={{ fontSize: fontSize || '12px' }}>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      );
    case 'textSplit':
      return (
        <div style={{ ...containerStyles, justifyContent: getJustifyContent(styles.textAlign) }} className="w-full flex py-8">
          <div className={`w-full flex flex-col items-center gap-12 max-w-6xl ${styles.flexDirection === 'row-reverse' ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
            <div className={`flex-1 space-y-4 ${getAlignmentClasses(styles.textAlign)}`}>
              <h2 className="text-3xl font-serif italic">{props.title}</h2>
              <p className="opacity-70 leading-relaxed" style={{ fontSize: fontSize || '13px' }}>{props.content}</p>
            </div>
            {props.imageUrl && (
              <div className="flex-1 flex justify-center w-full">
                <img src={props.imageUrl} alt={props.title} className="max-w-full h-auto object-cover border border-[var(--border)]" style={{ width: width || '100%' }} />
              </div>
            )}
          </div>
        </div>
      );
    case 'testimonials':
      return (
        <div style={{ ...containerStyles, justifyContent: getJustifyContent(styles.textAlign) }} className="w-full flex py-8">
          <div className={`w-full grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl ${getAlignmentClasses(styles.textAlign)}`}>
            {props.reviews?.map((rev: any, i: number) => (
              <div key={i} className="p-6 border border-[var(--border)] bg-[var(--background)] flex flex-col gap-4">
                <p className="italic opacity-80 leading-relaxed" style={{ fontSize: fontSize || '13px' }}>"{rev.text}"</p>
                <div className="mt-auto pt-4 border-t border-[var(--border)]">
                  <p className="font-bold text-[11px] uppercase tracking-widest">{rev.name}</p>
                  <p className="text-[9px] uppercase tracking-widest opacity-50">{rev.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 'dynamicForm':
      return (
        <div style={{ ...containerStyles, justifyContent: getJustifyContent(styles.textAlign) }} className="w-full flex my-8">
          <div className={`w-full max-w-2xl border border-dashed border-[var(--border)] p-8 bg-[var(--card)] ${getAlignmentClasses(styles.textAlign)}`}>
            <h2 className="text-2xl font-serif italic mb-2">{props.title}</h2>
            <p className="text-[11px] uppercase tracking-widest opacity-60 mb-6">{props.subtitle}</p>
            <div className="text-[9px] uppercase tracking-widest text-primary-400 bg-primary-400/10 py-4 px-4 text-center">
              [ Dynamic Form Area: Renders natively on the live site ]
            </div>
          </div>
        </div>
      );
    case 'heroSplitImage':
      return (
        <div style={{ ...containerStyles, justifyContent: getJustifyContent(styles.textAlign) }} className={`w-full flex ${getAlignmentClasses(styles.textAlign)}`}>
          <div className="bg-transparent dark:bg-gray-900 w-full">
            <div className="container px-6 py-16 mx-auto">
              <div className="items-center lg:flex">
                <div className="w-full lg:w-1/2">
                  <div className="lg:max-w-lg">
                    <h1 className="text-3xl font-semibold text-gray-800 dark:text-white lg:text-4xl" dangerouslySetInnerHTML={{ __html: props.title || 'Title' }}></h1>
                    <p className="mt-3 text-gray-600 dark:text-gray-400" style={{ fontSize: fontSize || '16px' }}>{props.subtitle}</p>
                    {props.buttonText && (
                      <a href={props.buttonUrl || '#'} className="inline-block px-5 py-2 mt-6 text-sm tracking-wider text-white uppercase transition-colors duration-300 transform bg-blue-600 rounded-lg lg:w-auto hover:bg-blue-500 focus:outline-none focus:bg-blue-500 text-center">
                        {props.buttonText}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-center w-full mt-6 lg:mt-0 lg:w-1/2">
                  <img className="w-full h-full lg:max-w-3xl object-cover" src={props.imageUrl} alt="Hero representation" style={{ width: width || '100%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    case 'pricingTable':
      return (
        <div style={{ ...containerStyles, justifyContent: getJustifyContent(styles.textAlign) }} className={`w-full flex ${getAlignmentClasses(styles.textAlign)}`}>
          <div className="bg-transparent dark:bg-gray-900 w-full">
            <div className="container px-6 py-8 mx-auto">
              <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 lg:text-3xl dark:text-gray-100">{props.title}</h2>
                  <p className="mt-4 text-gray-500 dark:text-gray-400" style={{ fontSize: fontSize || '16px' }}>{props.subtitle}</p>
                </div>
              </div>
              <div className="grid gap-6 mt-16 -mx-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {props.tiers?.map((tier: any, i: number) => (
                  <div key={i} className={`px-6 py-4 transition-colors duration-300 transform rounded-lg ${tier.isPopular ? 'bg-gray-700 dark:bg-gray-800' : 'hover:bg-gray-200 dark:hover:bg-gray-800'}`}>
                    <p className={`text-lg font-medium ${tier.isPopular ? 'text-gray-100' : 'text-gray-800 dark:text-gray-100'}`}>{tier.name}</p>
                    <h4 className={`mt-2 text-3xl font-semibold ${tier.isPopular ? 'text-gray-100' : 'text-gray-800 dark:text-gray-100'}`}>{tier.price} <span className={`text-base font-normal ${tier.isPopular ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>{tier.period}</span></h4>
                    {tier.buttonText && (
                      <a href={tier.buttonUrl || '#'} className="block text-center w-full px-4 py-2 mt-10 font-medium tracking-wide text-white bg-blue-500 rounded-md">
                        {tier.buttonText}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div style={containerStyles} className="p-8 border border-dashed border-[var(--border)] opacity-50 text-center text-[10px] uppercase tracking-widest w-full">
          Unknown block type: {type}
        </div>
      );
  }
}