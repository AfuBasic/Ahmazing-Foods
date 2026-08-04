/**
 * WatermarkedImage — renders a food photo with:
 *  • AHmazing Foods logo overlaid (bottom-right, semi-transparent)
 *  • right-click context menu disabled
 *  • dragging disabled
 *
 * Use this instead of a bare <img> for every product / food photo on the site.
 */

const BASE = import.meta.env.BASE_URL;
const LOGO = `${BASE}assets/logo.png`;

interface WatermarkedImageProps {
  src: string;
  alt: string;
  /** Extra classes applied to the <img> — defaults to "w-full h-full object-cover" */
  imgClassName?: string;
  /** Extra classes applied to the outer wrapper div */
  className?: string;
}

function noContext(e: React.MouseEvent) {
  e.preventDefault();
}

export function WatermarkedImage({
  src,
  alt,
  imgClassName = "w-full h-full object-cover",
  className = "",
}: WatermarkedImageProps) {
  return (
    <div className={`relative w-full h-full select-none ${className}`}>
      <img
        src={src}
        alt={alt}
        className={imgClassName}
        draggable={false}
        onContextMenu={noContext}
      />
      {/* Brand watermark — pointer-events:none so it never blocks hover/click */}
      <img
        src={LOGO}
        alt=""
        aria-hidden
        draggable={false}
        onContextMenu={noContext}
        style={{
          position: "absolute",
          bottom: "8px",
          right: "8px",
          width: "56px",
          opacity: 0.45,
          pointerEvents: "none",
          userSelect: "none",
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
        }}
      />
    </div>
  );
}
