import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';

export async function convertToGeoJson(location: string): Promise<GeoJSON.Point> {
  const results = await geocodeByAddress(location);
  const { lat, lng } = await getLatLng(results[0]);

  return {
    type: 'Point',
    coordinates: [lng as number, lat as number]
  };
}

export async function reverseGeocode(coordinates: number[]): Promise<string> {
  return new Promise((resolve: (value: string) => void, reject) => {
    try {
      const Geocoder: google.maps.Geocoder = new window['google']['maps']['Geocoder']();

      if (!coordinates) {
        reject('Please provide coordinates to reverse geocode');
      } else {
        Geocoder.geocode({ location: { lat: coordinates[0], lng: coordinates[1] } }, (results, status) => {
          if (status !== google.maps.GeocoderStatus.OK) {
            reject(status);
          } else {
            resolve(results[0].formatted_address);
          }
        });
      }
    } catch (e) {
      reject(e);
    }
  });
}
