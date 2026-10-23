// City brands for the "City" toolbar menu: real tenants, values copied from
// each platform's own app configuration (settings.core colours and
// style.customFontName, 23 Oct 2026). "Go Vocal default" is what getTheme()
// falls back to without a tenant.
//
// The cities' own faces (Lentia Nova, Wiener Melange, KBH) are licensed to
// them and their hosts serve the files without CORS, so the stack names the
// real face first (it renders where it is installed) and then an open
// Google Fonts face in the same spirit, loaded from `fontCss`: picked to look
// clearly unlike Public Sans and each other, so a city switch shows what a
// tenant font does (Linz: a sturdy grotesk; Wien: a round geometric; KBH: a
// wide, quirky face). Dublin uses Public Sans, the platform default.
export const cities = {
  default: {
    title: 'Go Vocal default',
    color_main: '#ef0071',
    color_secondary: '#000000',
    color_text: '#333333',
  },
  linz: {
    title: 'Linz',
    color_main: '#604596',
    color_secondary: '#ea4f53',
    color_text: '#313131',
    font: '"LentiaNova-Neutral", "Space Grotesk"',
    fontCss:
      'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap',
  },
  dublin: {
    title: 'Dublin',
    color_main: '#0077a3',
    color_secondary: '#d53b0c',
    color_text: '#00131c',
  },
  wien: {
    title: 'Wien',
    color_main: '#ff5a64',
    color_secondary: '#462346',
    color_text: '#000000',
    font: '"WienerMelange_W_Rg", "Jost"',
    fontCss:
      'https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&display=swap',
  },
  kobenhavn: {
    title: 'København',
    color_main: '#000c2e',
    color_secondary: '#851852',
    color_text: '#000c2e',
    font: '"KBH-Regular", "Syne"',
    fontCss:
      'https://fonts.googleapis.com/css2?family=Syne:wght@400..800&display=swap',
  },
};

export type CityKey = keyof typeof cities;

type City = {
  title: string;
  color_main: string;
  color_secondary: string;
  color_text: string;
  font?: string;
  fontCss?: string;
};

export const cityOf = (key: CityKey): City =>
  (cities as Record<string, City>)[key] ?? cities.default;

// The minimal tenant shape getTheme() reads.
export const cityTenant = (key: CityKey) => {
  const { color_main, color_secondary, color_text, font } = cityOf(key);
  return {
    data: {
      attributes: {
        settings: { core: { color_main, color_secondary, color_text } },
        style: font ? { customFontName: font } : {},
      },
    },
  };
};
