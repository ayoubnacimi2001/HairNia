import { PageBlock } from '../../store/useBuilderStore';
import { DateRangePicker, RangeValue } from '../../components/DateRangePicker';
import { useState } from 'react';

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

function DateRangeBlock({ props, styles, containerStyles }: { props: any, styles: any, containerStyles: any }) {
  const [date, setDate] = useState<RangeValue>(null);
  return (
    <div style={{ ...containerStyles, alignItems: getAlignItems(styles.textAlign) }} className={`relative flex flex-col justify-center w-full overflow-hidden ${getAlignmentClasses(styles.textAlign)} py-16`}>
      {props.bgImageUrl && (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${props.bgImageUrl})` }} />
          <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: styles.bgOverlayOpacity !== undefined ? styles.bgOverlayOpacity : 0.5 }} />
        </>
      )}
      <div className="relative z-10 w-full max-w-md mx-auto p-10 bg-[var(--card)]/95 backdrop-blur-md border border-[var(--border)] shadow-2xl rounded-2xl">
        {props.title && <h2 className="text-2xl font-serif italic mb-2">{props.title}</h2>}
        {props.subtitle && <p className="text-[11px] uppercase tracking-widest opacity-60 mb-6">{props.subtitle}</p>}
        <div className={`mt-6 flex flex-col gap-4 ${styles.textAlign === 'left' ? 'items-start' : styles.textAlign === 'right' ? 'items-end' : 'items-center'}`}>
          <div className="w-full text-left">
                    <DateRangePicker value={date} onChange={setDate} inline={true} />
          </div>
          {props.buttonText && (
            <a href={props.buttonUrl || '#'} style={{ backgroundColor: styles.buttonBgColor || 'var(--theme-primary)', color: styles.buttonTextColor || '#000000' }} className="inline-block w-full py-4 px-8 text-[11px] font-bold uppercase tracking-widest transition-opacity hover:opacity-90 text-center shadow-lg rounded-lg">
              {props.buttonText}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function BlockRenderer({ block }: { block: PageBlock }) {
  const { type, props, styles = {} } = block;
  const { width, fontSize, ...containerStyles } = styles;

  switch (type) {
    case 'hero':
      return (
        <div style={{ ...containerStyles, alignItems: getAlignItems(styles.textAlign) }} className={`relative flex flex-col justify-center w-full overflow-hidden ${getAlignmentClasses(styles.textAlign)}`}>
          {props.bgImageUrl && (
            <>
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${props.bgImageUrl})` }} />
              <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: styles.bgOverlayOpacity !== undefined ? styles.bgOverlayOpacity : 0 }} />
            </>
          )}
          <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col p-4" style={{ alignItems: getAlignItems(styles.textAlign) }}>
            <h1 className="text-4xl md:text-6xl font-serif italic mb-4" dangerouslySetInnerHTML={{ __html: props.title || 'Hero Title' }}></h1>
            <p className="opacity-80 mb-6 leading-relaxed" style={{ fontSize: fontSize || '14px' }}>{props.subtitle || 'Hero subtitle goes here'}</p>
            {props.buttonText && (
              <a href={props.buttonUrl || '#'} style={{ backgroundColor: styles.buttonBgColor || 'var(--theme-primary)', color: styles.buttonTextColor || '#000000' }} className="inline-block py-3 px-8 text-[11px] font-bold uppercase tracking-widest rounded-sm transition-opacity hover:opacity-90 text-center">
                {props.buttonText}
              </a>
            )}
          </div>
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
                  <span>{item.question}</span>
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
    case 'pricingTable':
      return (
        <div style={{ ...containerStyles, justifyContent: getJustifyContent(styles.textAlign) }} className={`w-full flex ${getAlignmentClasses(styles.textAlign)}`}>
          <div className="w-full">
            <div className="container px-6 py-8 mx-auto">
              {props.title && (
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 lg:text-3xl dark:text-gray-100"><span>{props.title}</span></h2>
                  {props.subtitle && <p className="mt-4 text-gray-500 dark:text-gray-400" style={{ fontSize: fontSize || '16px' }}><span>{props.subtitle}</span></p>}
                </div>
              )}
              <div className="flex flex-col items-center justify-center space-y-8 lg:-mx-4 lg:flex-row lg:items-stretch lg:space-y-0">
                {props.tiers?.map((tier: any, i: number) => (
                  <div key={i} className={`flex flex-col w-full max-w-sm p-8 space-y-8 text-center bg-white border-2 ${tier.isPopular ? 'border-primary-400' : 'border-gray-200'} rounded-lg lg:mx-4 dark:bg-gray-900 dark:border-gray-700`} style={styles.cardBgColor ? { backgroundColor: styles.cardBgColor } : {}}>
                      <div className="flex-shrink-0">
                          <h2 className="inline-flex items-center justify-center px-2 font-semibold tracking-tight text-blue-400 uppercase rounded-lg bg-gray-50 dark:bg-gray-700">
                              <span>{tier.name}</span>
                          </h2>
                      </div>
                      <div className="flex-shrink-0">
                          <span className="pt-2 text-3xl font-bold text-gray-800 uppercase dark:text-gray-100">
                              <span>{tier.price}</span>
                          </span>
                          {tier.period && (
                            <span className="text-gray-500 dark:text-gray-400 ml-1">
                                <span>{tier.period}</span>
                            </span>
                          )}
                      </div>
                      <ul className="flex-1 space-y-4">
                          {tier.features?.map((feature: string, idx: number) => (
                            <li key={idx} className="text-gray-500 dark:text-gray-400">
                                <span>{feature}</span>
                            </li>
                          ))}
                      </ul>
                      <a href={tier.buttonUrl || '#'} style={{ backgroundColor: styles.buttonBgColor || '#3b82f6', color: styles.buttonTextColor || '#ffffff' }} className="inline-flex items-center justify-center px-4 py-2 font-medium uppercase transition-colors rounded-lg hover:opacity-90 focus:outline-none">
                          <span>{tier.buttonText || 'Start'}</span>
                      </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    case 'prelineProductGrid':
      return (
        <div style={{ ...containerStyles, justifyContent: getJustifyContent(styles.textAlign) }} className={`w-full flex ${getAlignmentClasses(styles.textAlign)}`}>
          <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto w-full">
            <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
              <h2 className="text-2xl font-bold md:text-4xl md:leading-tight dark:text-white" dangerouslySetInnerHTML={{ __html: props.title || 'Products' }}></h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {props.products?.map((product: any, i: number) => (
                <div key={i} className="group flex flex-col h-full border border-gray-200 shadow-sm rounded-xl overflow-hidden dark:border-gray-700 dark:shadow-slate-700/[.7]" style={styles.cardBgColor ? { backgroundColor: styles.cardBgColor } : { backgroundColor: '#ffffff' }}>
                  <div className="h-52 flex flex-col justify-center items-center bg-gray-100 rounded-t-xl dark:bg-slate-800 overflow-hidden">
                    <img src={product.image} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-in-out" />
                  </div>
                  <div className="p-4 md:p-6 flex flex-col flex-1 text-left">
                    <span className="block mb-1 text-xs font-semibold uppercase text-primary-400">{product.origin}</span>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-300 dark:hover:text-white">{product.name}</h3>
                    <p className="mt-3 text-gray-500 dark:text-gray-400 text-sm flex-1">{product.notes}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-800 dark:text-gray-200">{product.price}</span>
                      <a href={product.buttonUrl || props.buttonUrl || '#'} style={{ backgroundColor: styles.buttonBgColor || 'var(--theme-primary)', color: styles.buttonTextColor || '#000000' }} className="py-2 px-3 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all">Buy Now</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case 'prelineStory':
      return (
        <div style={{ ...containerStyles, justifyContent: getJustifyContent(styles.textAlign) }} className={`w-full flex ${getAlignmentClasses(styles.textAlign)}`}>
          <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto w-full">
            <div className={`md:grid md:grid-cols-2 md:items-center md:gap-12 xl:gap-32 ${styles.flexDirection === 'row-reverse' ? 'md:grid-flow-col-dense' : ''}`}>
              <div className={`${styles.flexDirection === 'row-reverse' ? 'col-start-2' : ''}`}>
                <img className="rounded-xl w-full object-cover" src={props.imageUrl} alt={props.title} style={{ width: width || '100%', height: 'auto', maxHeight: '600px' }} />
              </div>
              <div className="mt-5 sm:mt-10 lg:mt-0 text-left">
                <div className="space-y-6 sm:space-y-8">
                  <div className="space-y-2 md:space-y-4">
                    <h2 className="font-bold text-3xl lg:text-4xl text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: props.title || 'Story' }}></h2>
                    <p className="text-gray-500 dark:text-gray-400" style={{ fontSize: fontSize || '16px' }}>{props.description}</p>
                  </div>
                  {props.buttonText && (
                    <div>
                      <a href={props.buttonUrl || '#'} style={{ backgroundColor: styles.buttonBgColor || 'var(--theme-primary)', color: styles.buttonTextColor || '#000000' }} className="inline-flex justify-center items-center gap-x-3 text-center hover:opacity-90 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition py-3 px-4">{props.buttonText}</a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    case 'faqGrid':
      return (
        <div style={{ ...containerStyles, justifyContent: getJustifyContent(styles.textAlign) }} className={`relative w-full flex ${getAlignmentClasses(styles.textAlign)} py-16`}>
          {props.bgImageUrl && (
            <>
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${props.bgImageUrl})` }} />
              <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: styles.bgOverlayOpacity !== undefined ? styles.bgOverlayOpacity : 0.5 }} />
            </>
          )}
          <div className="relative z-10 container px-6 mx-auto max-w-6xl">
              {props.title && <h2 className="text-3xl font-serif italic text-[var(--foreground)] mb-12">{props.title}</h2>}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {props.items?.map((item: any, i: number) => (
                      <div key={i} className="text-left bg-[var(--card)] border border-[var(--border)] p-6 shadow-lg">
                          <div className="inline-block p-3 text-black bg-primary-400 rounded-sm mb-6">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                          </div>
                          <div>
                              <h3 className="text-lg font-bold text-[var(--foreground)] tracking-wide mb-3">{item.question}</h3>
                              <p className="text-[13px] text-[var(--foreground)]/60 leading-relaxed" style={{ fontSize: fontSize || '13px' }}>
                                  {item.answer}
                              </p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
        </div>
      );
        case 'dateRange':
          return <DateRangeBlock props={props} styles={styles} containerStyles={containerStyles} />;
    default:
      return (
        <div style={containerStyles} className="p-8 border border-dashed border-[var(--border)] opacity-50 text-center text-[10px] uppercase tracking-widest w-full">
          <span>Unknown block type: {type}</span>
        </div>
      );
  }
}