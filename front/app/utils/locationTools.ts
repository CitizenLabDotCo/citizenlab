import { isNumber } from 'lodash-es';

type Point = {
  type: 'Point';
  coordinates: [number, number];
};

const requestOptions = {
  method: 'GET',
};

const key = process.env.GOOGLE_MAPS_API_KEY;

const geocode = async (address: string | null | undefined) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${key}`,
      requestOptions
    );
    const result = await response.json();

    const lat = result?.results?.[0]?.geometry?.location?.lat;
    const lng = result?.results?.[0]?.geometry?.location?.lng;

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

const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`,
      requestOptions
    );
    const result = await response.json();

    const formattedAddress = result?.results?.[0]?.formatted_address;

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
  return { location_point_geojson, location_description };
};

export { geocode, reverseGeocode, parsePosition };
