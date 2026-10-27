// City brands for the "City" toolbar menu. The default is the platform's
// own: the colours a new platform gets (the `default`s of color_main,
// color_secondary and color_text in back/config/schemas/settings.schema.json.erb)
// and no custom font, so getTheme() gives Public Sans. The others are real
// tenants, values copied from each platform's own app configuration
// (settings.core colours and style.customFontName, 23 Oct 2026).
//
// The cities' own faces (Lentia Nova, Wiener Melange, KBH) are licensed to
// them and their hosts serve the files without CORS, so the stack names the
// real face first (it renders where it is installed) and then an open
// Google Fonts face in the same spirit, loaded from `fontCss`: a look-alike,
// and the menu says so. Dublin uses Public Sans, the platform default.
export const cities = {
  default: {
    title: 'Go Vocal default',
    color_main: '#163A7D',
    color_secondary: '#CF4040',
    color_text: '#163A7D',
  },
  linz: {
    title: 'Linz (look-alike font)',
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
    title: 'Wien (look-alike font)',
    color_main: '#ff5a64',
    color_secondary: '#462346',
    color_text: '#000000',
    font: '"WienerMelange_W_Rg", "Jost"',
    fontCss:
      'https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&display=swap',
  },
  kobenhavn: {
    title: 'København (look-alike font)',
    color_main: '#000c2e',
    color_secondary: '#851852',
    color_text: '#000c2e',
    font: '"KBH-Regular", "Syne"',
    fontCss:
      'https://fonts.googleapis.com/css2?family=Syne:wght@400..800&display=swap',
  },
};

export type CityKey = keyof typeof cities;

export const DEFAULT_CITY: CityKey = 'default';

type City = {
  title: string;
  color_main: string;
  color_secondary: string;
  color_text: string;
  font?: string;
  fontCss?: string;
};

export const cityOf = (key: CityKey): City =>
  (cities as Record<string, City>)[key] ?? cities[DEFAULT_CITY];

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

// The city the canvas renders now, so the mocked app configuration answers
// with the same colours and font as the theme: one tenant per story.
let canvasCity: CityKey = DEFAULT_CITY;
export const setCanvasCity = (key: CityKey) => {
  canvasCity = key;
};
export const getCanvasCity = () => canvasCity;
