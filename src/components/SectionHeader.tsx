import React from 'react';

type SectionHeaderProps = {
  subtitle?: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
};

export default function SectionHeader({ subtitle, title, description, align = 'center' }: SectionHeaderProps) {
  const alignmentClass = align === 'center' ? 'text-center' : 'text-left';
  return (
    <section className={`mb-10 ${alignmentClass}`}> 
      {subtitle && (
        <p className="text-brand text-sm uppercase tracking-wider mb-2">
          {subtitle}
        </p>
      )}
      <h2 className="text-3xl md:text-4xl font-heading font-extrabold uppercase tracking-tight text-white mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-gray-400 text-base max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </section>
  );
}
