import { Point } from 'geojson';
import { isNilOrError } from 'utils/helperUtils';
import { geocode } from 'utils/locationTools';

export const getLocationGeojson = async (
  initialFormData: { [k: string]: any } | null,
  data: {
    location_description?: string | null;
    location_point_geojson?: any;
  }
) => {
  let location_point_geojson: Point | null = null;

  // If initial data has location point and location is unchanged, add point to data
  if (
    !isNilOrError(initialFormData) &&
    (data && data.location_description) === initialFormData.location_description
  ) {
    location_point_geojson = initialFormData.location_point_geojson;
  } else {
    if (data.location_description && !data.location_point_geojson) {
      location_point_geojson = await geocode(data.location_description);
    }
  }
  return location_point_geojson;
};
