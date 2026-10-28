import { DEFAULT_CITY, setCanvasCity } from '../cities';

import { cityAppConfiguration } from './appConfiguration';

describe('cityAppConfiguration', () => {
  afterEach(() => setCanvasCity(DEFAULT_CITY));

  it("answers with the platform's defaults and no custom font by default", () => {
    const { attributes } = cityAppConfiguration();
    expect(attributes.settings.core).toMatchObject({
      color_main: '#163A7D',
      color_secondary: '#CF4040',
      color_text: '#163A7D',
    });
    expect(attributes.style).toEqual({});
  });

  it('follows the canvas city, font included', () => {
    setCanvasCity('linz');
    const { attributes } = cityAppConfiguration();
    expect(attributes.settings.core.color_main).toBe('#604596');
    expect(attributes.style).toEqual({
      customFontName: '"LentiaNova-Neutral", "Space Grotesk"',
    });
  });
});
