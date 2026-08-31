import Image from "next/image";

/*
  Placeholder product imagery.

  There is no photography yet, so rather than grey boxes this draws a
  colour-blocked silhouette per category, tinted by the variant colour. It
  reads as an intentional illustrated catalogue and — more usefully — it
  exercises the real masonry at real aspect ratios.

  When photography arrives, this component becomes a `next/image` and
  nothing else in the tree changes.
*/

type Rgb = [number, number, number];

const CANVAS: Rgb = [250, 249, 247];
const INK: Rgb = [43, 39, 36];
/* Fallback tone for colourways too pale to hold a silhouette on their own. */
const WARM_GREY: Rgb = [220, 214, 204];

function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/* Mix `a` toward `b` by `t` (0 = a, 1 = b). */
function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function shade(c: Rgb, t: number): Rgb {
  return mix(c, INK, t);
}

function css([r, g, b]: Rgb): string {
  return `rgb(${r} ${g} ${b})`;
}

/*
  How close this colourway is to white, 0–1.

  Pearl and Cream sit near the canvas, so tinting them the same way as
  Cherry leaves a shape that is technically drawn and practically invisible.
  Pale colours get pushed toward a warm grey background and a darker
  silhouette instead.
*/
function paleness(c: Rgb): number {
  const lum = (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
  return Math.min(Math.max((lum - 0.7) / 0.3, 0), 1);
}

/* Stable per-product jitter so the grid never looks mechanically uniform. */
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

type ShotProps = {
  fill: string;
  stroke: string;
};

/*
  Silhouettes are drawn in a 100×100 viewBox with `preserveAspectRatio`
  letting them sit centred in whatever aspect the card asks for.
*/
function Silhouette({
  category,
  fill,
  stroke,
}: ShotProps & { category: string }) {
  switch (category) {
    case "claw-clips":
      return (
        <g>
          <rect
            x="26"
            y="18"
            width="48"
            height="64"
            rx="16"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
          <path
            d="M38 30v40M50 26v48M62 30v40"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.55"
          />
        </g>
      );
    case "bows":
      return (
        <g>
          <path
            d="M50 50C50 50 32 30 22 38S20 62 32 64s18-14 18-14Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
          <path
            d="M50 50s18-20 28-12 2 24-10 26-18-14-18-14Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
          <circle cx="50" cy="50" r="7" fill={stroke} opacity="0.75" />
          <path
            d="M44 56 38 78M56 56l6 22"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.55"
          />
        </g>
      );
    case "scrunchies":
      return (
        <g>
          <circle
            cx="50"
            cy="50"
            r="30"
            fill="none"
            stroke={fill}
            strokeWidth="20"
          />
          <circle
            cx="50"
            cy="50"
            r="30"
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
            strokeDasharray="5 7"
            opacity="0.6"
          />
        </g>
      );
    case "charms":
      return (
        <g>
          <circle
            cx="50"
            cy="20"
            r="10"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
            opacity="0.7"
          />
          <path
            d="M50 34c14 0 24 12 24 26S64 84 50 84 26 74 26 60s10-26 24-26Z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
        </g>
      );
    case "earrings":
      return (
        <g>
          <circle
            cx="34"
            cy="58"
            r="20"
            fill="none"
            stroke={fill}
            strokeWidth="9"
          />
          <circle
            cx="70"
            cy="46"
            r="14"
            fill="none"
            stroke={fill}
            strokeWidth="9"
          />
          <circle cx="34" cy="34" r="3.5" fill={stroke} opacity="0.8" />
          <circle cx="70" cy="28" r="3.5" fill={stroke} opacity="0.8" />
        </g>
      );
    case "rings":
      return (
        <g>
          <circle
            cx="50"
            cy="56"
            r="26"
            fill="none"
            stroke={fill}
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="56"
            r="26"
            fill="none"
            stroke={stroke}
            strokeWidth="1"
            opacity="0.5"
          />
          <circle cx="50" cy="26" r="8" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </g>
      );
    default:
      /* A category with no drawing yet still gets a shape rather than a hole. */
      return (
        <circle
          cx="50"
          cy="50"
          r="28"
          fill={fill}
          stroke={stroke}
          strokeWidth="1.5"
        />
      );
  }
}

export type ProductImageProps = {
  category: string;
  /* Variant colour as a hex string, straight off the catalogue row. */
  hex: string;
  /* height / width */
  aspect: number;
  seed: string;
  /* The hover shot: recomposed, warmer, slightly zoomed. */
  variant?: "primary" | "secondary";
  /* Real photography. When absent, the drawn silhouette is used instead. */
  src?: string;
  alt?: string;
  className?: string;
};

export default function ProductImage({
  category,
  hex,
  aspect,
  seed,
  variant = "primary",
  src,
  alt = "",
  className = "",
}: ProductImageProps) {
  if (src) {
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        style={{ aspectRatio: `1 / ${aspect}` }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    );
  }

  const base = hexToRgb(/^#[0-9a-f]{6}$/i.test(hex) ? hex : "#D6D0C7");
  const h = hash(seed + variant);

  const secondary = variant === "secondary";
  const pale = paleness(base);

  /* Background is a heavy tint so the canvas stays quiet. */
  const bg = mix(
    mix(base, CANVAS, secondary ? 0.72 : 0.86),
    WARM_GREY,
    0.6 * pale,
  );
  const bgDeep = mix(
    mix(base, CANVAS, secondary ? 0.58 : 0.76),
    WARM_GREY,
    0.75 * pale,
  );

  /* Pale colourways darken rather than lighten, or they vanish. */
  const fill =
    pale > 0
      ? shade(base, 0.06 + 0.22 * pale)
      : mix(base, CANVAS, secondary ? 0.06 : 0.16);
  const stroke = shade(base, 0.42 + 0.24 * pale);

  /* Off-centre the light source per product; nudge harder on the hover shot. */
  const lightX = 28 + (h % 30) + (secondary ? 22 : 0);
  const lightY = 22 + ((h >> 5) % 26);
  const scale = secondary ? 1.16 : 1;
  const rotate = ((h >> 9) % 9) - 4;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        aspectRatio: `1 / ${aspect}`,
        background: `radial-gradient(120% 100% at ${lightX}% ${lightY}%, ${css(bg)} 0%, ${css(bgDeep)} 100%)`,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        style={{
          transform: `scale(${scale}) rotate(${rotate}deg)`,
          transformOrigin: "center",
          padding: "14%",
          boxSizing: "border-box",
        }}
      >
        <Silhouette category={category} fill={css(fill)} stroke={css(stroke)} />
      </svg>
    </div>
  );
}
