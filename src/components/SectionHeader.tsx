import React from 'react';

export type SectionHeaderProps = {
  subtitle?: string | React.ReactNode;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  align?: 'center' | 'left';
  eyebrowStyle?: 'pill' | 'glow-line' | 'tracked' | 'minimal';
  badgeIcon?: React.ReactNode;
  className?: string;
};

export default function SectionHeader({
  subtitle,
  title,
  description,
  align = 'center',
  eyebrowStyle = 'pill',
  badgeIcon,
  className = '',
}: SectionHeaderProps) {
  const isCenter = align === 'center';
  const alignmentClass = isCenter ? 'text-center items-center' : 'text-left items-start';

  return (
    <header className={`mb-8 sm:mb-10 md:mb-12 flex flex-col ${alignmentClass} ${className}`}>
      {/* ── LEVEL 1: Eyebrow / Label (Subtle, Clean Uppercase with Proper Spacing) ── */}
      {subtitle && (
        <div className="mb-2 sm:mb-2.5">
          {eyebrowStyle === 'pill' ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#120e24]/90 border border-brand/35 backdrop-blur-md shadow-[0_0_12px_rgba(139,92,246,0.15)]">
              {badgeIcon ? (
                badgeIcon
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-light animate-pulse" />
              )}
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-brand-light">
                {subtitle}
              </span>
            </div>
          ) : eyebrowStyle === 'glow-line' ? (
            <div className="inline-flex items-center gap-2.5">
              <span className="w-5 sm:w-8 h-px bg-gradient-to-r from-transparent to-brand/70" />
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-light">
                {subtitle}
              </span>
              <span className="w-5 sm:w-8 h-px bg-gradient-to-l from-transparent to-brand/70" />
            </div>
          ) : (
            <span className="inline-block text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] text-brand-light">
              {subtitle}
            </span>
          )}
        </div>
      )}

      {/* ── LEVEL 2: Main Heading (Bold, Refined & Elegant Display Font) ── */}
      <h2 className="text-2xl xs:text-3xl sm:text-3xl md:text-4xl font-heading font-extrabold uppercase tracking-tight text-white leading-tight mb-2.5 sm:mb-3 max-w-3xl">
        {title}
      </h2>

      {/* ── LEVEL 3: Supporting Description (Clean, Readable Font with Comfortable Line-Height) ── */}
      {description && (
        <p
          className={`text-xs sm:text-sm md:text-base font-normal text-gray-400 leading-relaxed max-w-xl text-balance ${
            isCenter ? 'mx-auto' : ''
          }`}
        >
          {description}
        </p>
      )}
    </header>
  );
}
