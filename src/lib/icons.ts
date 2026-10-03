import {
  Briefcase,
  Building2,
  ExternalLink,
  FileText,
  GraduationCap,
  HandHeart,
  HardHat,
  Leaf,
  Phone,
  Receipt,
  Search,
  Shield,
  Sprout,
  Stethoscope,
} from 'lucide-static';

/** Lucide icons (ISC license), inlined at build time. Content refers to them by these names. */
export const icons = {
  certificates: FileText,
  business: Briefcase,
  tax: Receipt,
  social: HandHeart,
  health: Stethoscope,
  agriculture: Sprout,
  infrastructure: HardHat,
  education: GraduationCap,
  safety: Shield,
  environment: Leaf,
  office: Building2,
  phone: Phone,
  search: Search,
  external: ExternalLink,
} as const;

export type IconName = keyof typeof icons;
export const iconNames = Object.keys(icons) as [IconName, ...IconName[]];
