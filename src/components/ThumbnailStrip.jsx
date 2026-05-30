import { SLOT_RATIOS } from '../lib/canvasCompositor.js';

const THUMB_HEIGHT = 120; // fixed height, width computed from ratio

export default function ThumbnailStrip({ frames, totalShots, templateKey }) {
  const ratio = SLOT_RATIOS[templateKey] ?? { w: 4, h: 3 };
  const thumbW = Math.round(THUMB_HEIGHT * ratio.w / ratio.h);

  return (
    <div className="flex flex-row gap-2 justify-center items-center px-4 py-3 flex-shrink-0">
      {Array.from({ length: totalShots }).map((_, i) => {
        const isCaptured = !!frames[i];
        return (
          <div
            key={isCaptured ? `slot-${i}-captured` : `slot-${i}-empty`}
            className={`relative flex-shrink-0 rounded-xl overflow-hidden border-2 bg-md-surface-container-high ${
              isCaptured ? 'border-md-primary thumb-slot-pop' : 'border-md-outline-variant'
            }`}
            style={{ width: thumbW, height: THUMB_HEIGHT }}
          >
            {isCaptured ? (
              <img
                src={frames[i]}
                alt={`Shot ${i + 1}`}
                className="w-full h-full object-cover thumb-enter"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                  className="text-md-outline" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>
                <span className="text-md-outline text-[10px] font-medium">{i + 1}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
