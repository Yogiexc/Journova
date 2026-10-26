import React from 'react';

interface IssueCoverPlaceholderProps {
  volume?: number | string;
  issueNumber?: number | string;
  year?: number | string;
  title?: string;
  className?: string;
}

export function IssueCoverPlaceholder({
  volume,
  issueNumber,
  year,
  title,
  className = '',
}: IssueCoverPlaceholderProps) {
  const volText = volume ? `Vol. ${volume}` : '';
  const noText = issueNumber ? `No. ${issueNumber}` : '';
  const metaText = [volText, noText].filter(Boolean).join(' • ');

  return (
    <div
      className={`relative w-full h-full overflow-hidden flex flex-col justify-between p-5 text-white select-none ${className}`}
      style={{
        background: 'linear-gradient(145deg, #091326 0%, #102447 45%, #0b1a33 100%)',
      }}
    >
      {/* Decorative Guilloche/Grid Background */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 30%, rgba(212, 175, 55, 0.25) 0%, transparent 60%),
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 20px 20px, 20px 20px',
        }}
      />

      {/* Gold Foil Accent Borders */}
      <div className="absolute inset-2 border border-amber-400/25 rounded-sm pointer-events-none" />
      <div className="absolute inset-3 border border-amber-400/10 rounded-sm pointer-events-none" />

      {/* Top Header: Brand & Meta */}
      <div className="relative z-10 flex flex-col items-center text-center pt-2">
        <span className="text-[10px] tracking-[0.25em] uppercase text-amber-300/90 font-sans font-semibold">
          Journova Press
        </span>
        <span className="text-[9px] tracking-wider uppercase text-slate-400 font-sans mt-0.5">
          Peer-Reviewed Research
        </span>
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent mt-2" />
      </div>

      {/* Center: Quill / Star Motif & Title */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto py-4">
        {/* Emblem */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border border-amber-400/30 flex items-center justify-center bg-slate-900/60 shadow-inner">
            <svg
              className="w-6 h-6 text-amber-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              <polygon points="12 2 15 8 12 6 9 8 12 2" fill="currentColor" opacity="0.3" />
            </svg>
          </div>
          <div className="absolute -inset-1 rounded-full border border-amber-300/15 animate-pulse" />
        </div>

        <h4 className="text-sm font-serif font-bold text-slate-100 line-clamp-2 px-2 tracking-wide leading-snug">
          {title || 'Current Scientific Issue'}
        </h4>

        {metaText && (
          <p className="text-[11px] font-sans text-amber-300/80 mt-1 font-medium tracking-wider uppercase">
            {metaText}
          </p>
        )}
      </div>

      {/* Bottom Footer: ISSN & Year */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-2 text-[9px] text-slate-400 font-sans">
        <span className="tracking-widest uppercase">ISSN: 2985-6841</span>
        <span className="font-semibold text-amber-300/90">{year || new Date().getFullYear()}</span>
      </div>
    </div>
  );
}
