import { Point } from 'geojson';
import { isNumber } from 'lodash-es';

const geocode = (address: string | null | undefined) => {
  return new Promise((resolve: (value: GeoJSON.Point | null) => void) => {
    if (address && window?.google?.maps?.Geocoder) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        let response: GeoJSON.Point | null = null;

        if (status === google.maps.GeocoderStatus.OK) {
          const lat = results?.[0]?.geometry?.location?.lat();
          const lng = results?.[0]?.geometry?.location?.lng();

          if (isNumber(lat) && isNumber(lng)) {
            response = {
              type: 'Point',
              coordinates: [lng, lat],
            };
          }
        }

        resolve(response);
      });
    } else {
      resolve(null);
    }
  });
};

const reverseGeocode = (lat: number, lng: number) => {
  return new Promise((resolve: (value: string | undefined) => void) => {
    if (window?.google?.maps?.Geocoder) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        {
          location: {
            lat,
            lng,
          },
        },
        (results, status) => {
          let response: string | undefined = undefined;
          const formattedAddress = results?.[0]?.formatted_address;

          if (status === google.maps.GeocoderStatus.OK && formattedAddress) {
            response = formattedAddress;
          }
          resolve(response);
        }
      );
    } else {
      resolve(undefined);
    }
  });
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
