/**
 * High-quality illustrated bird images for each species.
 * Uses generated watercolor-style illustrations instead of simple SVG silhouettes.
 */

import storkImg from "../assets/birds/stork.png";
import craneImg from "../assets/birds/crane.png";
import pelicanImg from "../assets/birds/pelican.png";
import warblerImg from "../assets/birds/warbler.png";
import robinImg from "../assets/birds/robin.png";
import flycatcherImg from "../assets/birds/flycatcher.png";
import eagleImg from "../assets/birds/eagle.png";

export type BirdType = "stork" | "crane" | "pelican" | "warbler" | "robin" | "flycatcher" | "eagle" | "flamingo" | "generic";

interface BirdIconProps {
  type: BirdType;
  size?: number;
  className?: string;
}

const birdImages: Record<string, string> = {
  stork: storkImg,
  crane: craneImg,
  pelican: pelicanImg,
  warbler: warblerImg,
  robin: robinImg,
  flycatcher: flycatcherImg,
  eagle: eagleImg,
  flamingo: eagleImg, // fallback
  generic: eagleImg,  // fallback
};

const birdAlt: Record<string, string> = {
  stork: "חסידה לבנה",
  crane: "עגור אפור",
  pelican: "שקנאי לבן",
  warbler: "סבכי",
  robin: "אדום-חזה",
  flycatcher: "זמיר",
  eagle: "נשר",
  flamingo: "פלמינגו",
  generic: "ציפור",
};

const BirdIcon = ({ type, size = 32, className = "" }: BirdIconProps) => (
  <img
    src={birdImages[type] || birdImages.generic}
    alt={birdAlt[type] || "ציפור"}
    width={size}
    height={size}
    className={`object-contain ${className}`}
    draggable={false}
  />
);

/** Map bird IDs used in Station1 to icon types */
export const birdIdToIcon: Record<string, BirdType> = {
  stork: "stork",
  crane: "crane",
  pelican: "pelican",
  warbler: "warbler",
  robin: "robin",
  flycatcher: "flycatcher",
};

export default BirdIcon;
