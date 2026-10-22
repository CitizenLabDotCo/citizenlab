// Example city brands for the "City" toolbar menu. Same presets as the
// tenant swatches on the Augur design system page; "Go Vocal default" is
// what getTheme() falls back to without a tenant.
export const cities = {
  default: {
    title: 'Go Vocal default',
    color_main: '#ef0071',
    color_secondary: '#000000',
    color_text: '#333333',
  },
  blue: {
    title: 'Blue city',
    color_main: '#175CFF',
    color_secondary: '#FFB020',
    color_text: '#333333',
  },
  purple: {
    title: 'Purple city',
    color_main: '#7A3FF2',
    color_secondary: '#12B886',
    color_text: '#333333',
  },
  crimson: {
    title: 'Crimson city',
    color_main: '#C81E4E',
    color_secondary: '#2B8AA0',
    color_text: '#333333',
  },
};

export type CityKey = keyof typeof cities;

// The minimal tenant shape getTheme() reads.
export const cityTenant = (key: CityKey) => {
  const { color_main, color_secondary, color_text } =
    cities[key] ?? cities.default;
  return {
    data: {
      attributes: {
        settings: { core: { color_main, color_secondary, color_text } },
        style: {},
      },
    },
  };
};
