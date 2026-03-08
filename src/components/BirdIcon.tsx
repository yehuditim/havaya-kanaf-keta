/**
 * SVG bird silhouettes — consistent, species-accurate visual language.
 * Each bird type has a unique silhouette matching its real shape.
 */

interface BirdIconProps {
  type: "stork" | "crane" | "pelican" | "warbler" | "robin" | "flycatcher" | "eagle" | "flamingo" | "generic";
  size?: number;
  className?: string;
  color?: string;
}

const paths: Record<BirdIconProps["type"], string> = {
  // White Stork — tall, long straight beak, long legs
  stork:
    "M20 8c-1-3-4-5-7-4s-4 4-3 7c0 0-3 2-4 6s0 8 2 10l1 5h3l-1-5c2 1 5 0 7-2s3-5 2-8c3-1 4-3 4-5s-2-3-4-4zm-6 1c1 0 2 1 2 2s-1 1-2 1-1-1-1-2 1-1 1-1z",
  // Common Crane — large, long curved neck, elegant
  crane:
    "M26 10c-2-4-6-5-9-3s-4 5-2 9l-4 4c-2 2-2 5-1 7l2 5h3l-2-4c1 2 4 3 7 2s5-4 5-7c2 0 4-2 4-4 0-3-1-5-3-9zm-7 2c1 0 2 1 2 2s-1 2-2 2-2-1-2-2 1-2 2-2z",
  // White Pelican — massive beak pouch, heavy body
  pelican:
    "M28 14c0-4-3-7-7-8-3-1-6 0-8 2l-6 1c-2 1-3 3-2 5l1 3-2 6h3l2-5c0 3 2 5 5 6s6 0 8-2c2-1 4-3 5-5 1-1 1-2 1-3zm-14 0c1 0 1 1 1 2s-1 1-1 1-1 0-1-1 0-2 1-2zm4-2c-1 0-3 1-4 3h-3c0-2 3-4 5-4s3 1 2 1z",
  // Warbler — tiny songbird, thin beak, compact
  warbler:
    "M22 12c-1-2-3-3-5-3s-4 1-5 3c-1 1-2 3-1 5 0 1 1 3 3 4l-1 4h2l1-3c1 0 3 0 4-1s2-2 3-4c0-2 0-4-1-5zm-5 1c1 0 1 0 1 1s0 1-1 1-1 0-1-1 0-1 1-1z",
  // European Robin — round breast, upright posture
  robin:
    "M22 11c-1-2-3-4-5-4s-4 1-5 3c-1 2-1 4 0 6l-1 2c0 2 1 3 2 4l-1 4h2l1-3c1 1 3 1 5 0s3-3 3-5c1-1 1-3 1-4s-1-2-2-3zm-5 1c1 0 1 1 1 1s0 1-1 1-1 0-1-1 0-1 1-1zm-1 5c0-1 1-3 3-3s2 1 2 2-1 2-3 2-2 0-2-1z",
  // Flycatcher — small, perching, slim tail
  flycatcher:
    "M22 11c-1-2-3-3-5-3s-3 1-4 3c-1 1-1 3 0 5l-1 3c0 1 0 2 1 3l-1 5h2l1-4c1 1 2 1 4 0 1-1 2-2 3-4 0-2 0-3 0-5s-1-2-2-3zm-5 1c1 0 1 1 1 1s0 1-1 1-1-1-1-1 0-1 1-1z",
  // Eagle/raptor — broad wings, hooked beak
  eagle:
    "M28 12c-1-3-4-5-7-5s-6 1-8 4c-1 2-1 4 0 6l-3 2c-1 1-1 3 0 4l3 1-1 4h3l-1-4c2 1 5 1 7 0s4-3 5-6c1-1 2-3 2-4s0-2 0-2zm-8-1c1 0 2 1 2 2s-1 2-2 2-2-1-2-2 1-2 2-2z",
  // Flamingo — long neck, curved beak, long legs
  flamingo:
    "M18 6c-2 0-3 2-3 4l-1 6c-1 2-2 4-1 6l1 2-2 6h2l2-6c0 1 1 2 3 2s3-1 3-3c1-2 1-4 0-6l1-6c0-2-1-4-3-4s-2-1-2-1zm-1 5c1 0 1 1 1 1s0 1-1 1-1-1-1-1 0-1 1-1z",
  // Generic bird silhouette
  generic:
    "M24 12c-1-3-4-5-7-4s-4 3-3 6c-2 1-3 3-3 5s1 4 3 5l-1 4h3l-1-3c2 1 4 1 6 0s3-3 3-5c1-1 2-3 2-4 0-2-1-3-2-4zm-6 1c1 0 2 1 2 2s-1 1-2 1-1-1-1-2 0-1 1-1z",
};

const BirdIcon = ({ type, size = 32, className = "", color }: BirdIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d={paths[type] || paths.generic}
      fill={color || "currentColor"}
      fillRule="evenodd"
    />
  </svg>
);

/** Map bird IDs used in Station1 to icon types */
export const birdIdToIcon: Record<string, BirdIconProps["type"]> = {
  stork: "stork",
  crane: "crane",
  pelican: "pelican",
  warbler: "warbler",
  robin: "robin",
  flycatcher: "flycatcher",
};

export default BirdIcon;
