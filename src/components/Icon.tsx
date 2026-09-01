import type { IconType } from "react-icons";
import {
  HiOutlineBriefcase,
  HiOutlineBuildingOffice2,
  HiOutlineCpuChip,
  HiOutlineCubeTransparent,
  HiOutlineGlobeAlt,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineSquares2X2,
  HiOutlineTruck,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";
import { GiCargoShip, GiFactory, GiSofa, GiTShirt } from "react-icons/gi";

const ICONS: Record<string, IconType> = {
  cpu: HiOutlineCpuChip,
  sofa: GiSofa,
  ship: GiCargoShip,
  truck: HiOutlineTruck,
  shield: HiOutlineShieldCheck,
  briefcase: HiOutlineBriefcase,
  boxes: HiOutlineCubeTransparent,
  globe: HiOutlineGlobeAlt,
  layers: HiOutlineSquares2X2,
  layout: HiOutlineBuildingOffice2,
  sparkles: HiOutlineSparkles,
  shirt: GiTShirt,
  factory: GiFactory,
  building: HiOutlineBuildingOffice2,
  wrench: HiOutlineWrenchScrewdriver,
};

export default function Icon({ name, className }: { name: string; className?: string }) {
  const Component = ICONS[name] ?? HiOutlineSparkles;
  return <Component aria-hidden="true" className={className} />;
}
