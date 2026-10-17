/**
 * TaxIntuitive design tokens.
 *
 * Forest green anchors navigation and actions; amber highlights rewards.
 * Everything else is derived so light and dark both stay legible and calm.
 */

export const brand = {
  green: '#18745B',
  greenDark: '#125C49',
  teal: '#0CA678',
  orange: '#EAB66A',
  orangeDark: '#B25A10',
} as const;

export interface ThemeColors {
  /** page background */
  bg: string;
  /** raised surface (cards, sheets) */
  card: string;
  /** subtle surface for insets and secondary fills */
  subtle: string;
  /** primary text */
  ink: string;
  /** secondary text */
  muted: string;
  /** hairlines and borders */
  line: string;
  brand: string;
  brandDark: string;
  /** text/icon colour that sits on a brand-filled surface */
  onBrand: string;
  accent: string;
  onAccent: string;
  success: string;
  successBg: string;
  danger: string;
  dangerBg: string;
  warningBg: string;
  warningLine: string;
  warningInk: string;
  tipBg: string;
  tipLine: string;
  /** XP track colours */
  taxes: string;
  banking: string;
  credit: string;
  saving: string;
  investing: string;
  /** medal tiers */
  bronze: string;
  silver: string;
  gold: string;
  /** shadow colour (iOS) */
  shadow: string;
}

export const lightColors: ThemeColors = {
  bg: '#F6F7F3',
  card: '#FFFFFF',
  subtle: '#EFF3ED',
  ink: '#0F2F28',
  muted: '#5A726B',
  line: '#DCECE5',
  brand: brand.green,
  brandDark: brand.greenDark,
  onBrand: '#FFFFFF',
  accent: brand.orange,
  onAccent: '#35250F',
  success: '#2F9E44',
  successBg: '#E7F6EC',
  danger: '#E03131',
  dangerBg: '#FDECEC',
  warningBg: '#FFF5EC',
  warningLine: '#FFD8B0',
  warningInk: brand.orangeDark,
  tipBg: '#EEF7F3',
  tipLine: '#D5EBE2',
  taxes: brand.green,
  banking: brand.teal,
  credit: brand.orange,
  saving: '#40A86B',
  investing: '#4C6EF5',
  bronze: '#C07A3E',
  silver: '#8A9BA8',
  gold: '#D9A21B',
  shadow: 'rgba(16,110,84,0.18)',
};

export const darkColors: ThemeColors = {
  bg: '#0A1714',
  card: '#12241F',
  subtle: '#162C26',
  ink: '#E8F5F0',
  muted: '#9DB5AD',
  line: '#1F3B33',
  brand: '#2BD3A0',
  brandDark: '#2BD3A0',
  onBrand: '#04201A',
  accent: '#FFA94D',
  onAccent: '#2A1400',
  success: '#51CF66',
  successBg: '#11301C',
  danger: '#FF6B6B',
  dangerBg: '#3A1515',
  warningBg: '#33240F',
  warningLine: '#5C431C',
  warningInk: '#FFC078',
  tipBg: '#132A24',
  tipLine: '#20443A',
  taxes: '#2BD3A0',
  banking: '#38D9A9',
  credit: '#FFA94D',
  saving: '#69DB7C',
  investing: '#748FFC',
  bronze: '#D08B4F',
  silver: '#A9B8C3',
  gold: '#F0C144',
  shadow: 'rgba(0,0,0,0.5)',
};

/** 4pt spacing scale — "comfortable spacing" without magic numbers in screens. */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const type = {
  display: { fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
  h1: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  h2: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  h3: { fontSize: 17, fontWeight: '700' },
  body: { fontSize: 16, fontWeight: '400' },
  bodyStrong: { fontSize: 16, fontWeight: '600' },
  small: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12.5, fontWeight: '600' },
  overline: { fontSize: 11.5, fontWeight: '800', letterSpacing: 1 },
} as const;

/** Cross-platform soft shadow. */
export const shadow = (color: string) => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.12,
  shadowRadius: 8,
  elevation: 1,
});
