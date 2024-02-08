import { Point } from 'geojson';
import { isNilOrError } from 'utils/helperUtils';
import { geocode } from 'utils/locationTools';
import { IIdea } from 'api/ideas/types';
import { JsonFormsSchema } from 'api/idea_json_form_schema/types';
import { IIdeaImages } from 'api/idea_images/types';
import { IIdeaFiles } from 'api/idea_files/types';

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

export const getFormValues = (
  idea: IIdea,
  schema: JsonFormsSchema,
  remoteImages?: IIdeaImages,
  remoteFiles?: IIdeaFiles
) => {
  console.log('schema', schema);
  return Object.fromEntries(
    Object.keys(schema.properties).map((prop) => {
      if (prop === 'author_id') {
        return [prop, idea.data.relationships?.author?.data?.id];
      } else if (idea.data.attributes?.[prop]) {
        return [prop, idea.data.attributes?.[prop]];
      } else if (
        prop === 'topic_ids' &&
        Array.isArray(idea.data.relationships?.topics?.data)
      ) {
        return [
          prop,
          idea.data.relationships?.topics?.data.map((rel) => rel.id),
        ];
      } else if (
        prop === 'idea_images_attributes' &&
        Array.isArray(idea.data.relationships?.idea_images?.data)
      ) {
        return [prop, remoteImages?.data];
      } else if (prop === 'idea_files_attributes') {
        const attachmentsValue =
          !isNilOrError(remoteFiles) && remoteFiles.data.length > 0
            ? remoteFiles.data
            : undefined;
        return [prop, attachmentsValue];
      } else return [prop, undefined];
    })
  );
};
