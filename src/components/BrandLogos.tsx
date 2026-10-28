import React from 'react';

export const IdoomLogo: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => (
  <div
    style={{ width: size, height: size }}
    className={`bg-white rounded-full flex items-center justify-center font-bold text-black border border-black/10 select-none shadow-sm ${className}`}
  >
    <span style={{ fontSize: size * 0.32, letterSpacing: -0.5 }} className="font-extrabold tracking-tighter">
      IDOOM
    </span>
  </div>
);

export const MobilisLogo: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => (
  <div
    style={{ width: size, height: size }}
    className={`bg-white rounded-full flex flex-col items-center justify-center font-bold text-black border border-black/10 select-none shadow-sm ${className}`}
  >
    <span style={{ fontSize: size * 0.24, color: '#00843D' }} className="font-extrabold tracking-tighter">
      MOBILIS
    </span>
    <span style={{ fontSize: size * 0.16, color: '#000000', lineHeight: 1 }} className="font-semibold">
      PixX
    </span>
  </div>
);

export const DjezzyLogo: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => (
  <div
    style={{ width: size, height: size }}
    className={`bg-[#E30613] rounded-full flex items-center justify-center font-bold text-white select-none shadow-sm ${className}`}
  >
    <span style={{ fontSize: size * 0.28 }} className="font-black italic">
      DJ
    </span>
  </div>
);

export const OoredooLogo: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => (
  <div
    style={{ width: size, height: size }}
    className={`bg-[#ED1C24] rounded-full flex items-center justify-center font-bold text-white select-none shadow-sm ${className}`}
  >
    <span style={{ fontSize: size * 0.28 }} className="font-extrabold tracking-tighter">
      ooredoo
    </span>
  </div>
);

export const SonelgazLogo: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = '' }) => (
  <div
    style={{ width: size, height: size }}
    className={`bg-[#0055A5] rounded-full flex items-center justify-center font-bold text-white select-none shadow-sm ${className}`}
  >
    <span style={{ fontSize: size * 0.26 }} className="font-black">
      SNG
    </span>
  </div>
);

export const EdahabiaCircles: React.FC<{ size?: number; className?: string }> = ({ size = 18, className = '' }) => (
  <div style={{ width: size * 1.6, height: size }} className={`relative flex items-center ${className}`}>
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-[#EB001B] opacity-95 shadow-sm"
    />
    <div
      style={{ width: size, height: size, marginRight: -size * 0.4 }}
      className="rounded-full bg-[#F79E1B] opacity-95 shadow-sm"
    />
  </div>
);

export const AlgeriePosteBadge: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <div
    style={{ width: size, height: size }}
    className={`bg-[#00843D] text-white rounded-lg flex items-center justify-center font-black ${className}`}
  >
    <span style={{ fontSize: size * 0.48 }}>AP</span>
  </div>
);
