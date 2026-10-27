import { http, HttpResponse } from 'msw';

import { getAppConfigurationData } from '../../app/api/app_configuration/__mocks__/_mockServer';
import { cityOf, getCanvasCity } from '../cities';

// The app configuration mock with the canvas city's colours and font, so a
// story has one tenant: the theme and the configuration the components
// read agree. Replaces the platform mock's handler of the same key.
export const cityAppConfiguration = () => {
  const city = cityOf(getCanvasCity());
  const data = getAppConfigurationData();
  const { attributes } = data;
  attributes.settings.core = {
    ...attributes.settings.core,
    color_main: city.color_main,
    color_secondary: city.color_secondary,
    color_text: city.color_text,
  };
  attributes.style = city.font ? { customFontName: city.font } : {};
  return data;
};

const endpoints = {
  'GET app_configuration': http.get('/web_api/v1/app_configuration', () =>
    HttpResponse.json({ data: cityAppConfiguration() }, { status: 200 })
  ),
};

export default endpoints;
