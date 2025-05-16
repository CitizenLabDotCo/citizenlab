import { isNumber } from 'lodash-es';

import fetcher from './cl-react-query/fetcher';

export type Point = {
  type: 'Point';
  coordinates: [number, number];
};

type GeocodeResponse = {
  data: {
    type: 'geocode';
    attributes: {
      location: { lat: number; lng: number };
    };
  };
};

const geocode = async (address: string | null | undefined) => {
  try {
    const result = await fetcher<GeocodeResponse>({
      path: '/location/geocode',
      action: 'get',
      queryParams: {
        address,
      },
    });

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const lat = result?.data.attributes.location.lat;
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const lng = result?.data.attributes.location.lng;

    if (isNumber(lat) && isNumber(lng)) {
      return {
        type: 'Point',
        coordinates: [lng, lat],
      } as Point;
    }
    return null;
  } catch {
    return null;
  }
};

type ReverseGeocodeResponse = {
  data: {
    type: 'reverse_geocode';
    attributes: {
      formatted_address: string;
    };
  };
};

const reverseGeocode = async (lat: number, lng: number, language: string) => {
  try {
    const result = await fetcher<ReverseGeocodeResponse>({
      path: '/location/reverse_geocode',
      action: 'get',
      queryParams: {
        lat,
        lng,
        language,
      },
    });
    const formattedAddress = result.data.attributes.formatted_address;

    if (formattedAddress) {
      return formattedAddress;
    }
    return undefined;
  } catch {
    return undefined;
  }
};

const parsePosition = async (position?: string) => {
  let location_point_geojson: Point | null | undefined;
  let location_description: string | null | undefined;
  if (position) {
    switch (position) {
      case '':
        location_point_geojson = null;
        location_description = null;
        break;

      case undefined:
        location_point_geojson = undefined;
        location_description = undefined;
        break;

      default:
        location_point_geojson = await geocode(position);
        location_description = position;
        break;
    }
  }
  return { location_point_geojson, location_description };
};

export { geocode, reverseGeocode, parsePosition };
