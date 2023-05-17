import { Point } from 'geojson';
import { geocode } from 'utils/locationTools';
import { parse } from 'qs';
import { isNumber } from 'lodash-es';

export const getLocationGeojson = async (
  initialFormData: { [k: string]: any } | null,
  data: {
    location_description?: string | null;
    location_point_geojson?: any;
  }
) => {
  const search = location.search;
  let location_point_geojson: Point | null = null;
  const { lat, lng } = parse(search, {
    ignoreQueryPrefix: true,
    decoder: (str, _defaultEncoder, _charset, type) => {
      return type === 'value' ? parseFloat(str) : str;
    },
  }) as { [key: string]: string | number };

  if (
    lat &&
    lng &&
    isNumber(lat) &&
    isNumber(lng) &&
    initialFormData &&
    data.location_description === initialFormData['location_description']
  ) {
    location_point_geojson = {
      type: 'Point',
      coordinates: [lng, lat],
    };
  } else if (data.location_description) {
    location_point_geojson = await geocode(data.location_description);
  }
  return location_point_geojson;
};
