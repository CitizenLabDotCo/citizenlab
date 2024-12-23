import { Point } from 'geojson';

import { IIdeaFiles } from 'api/idea_files/types';
import { IIdeaImages } from 'api/idea_images/types';
import { JsonFormsSchema } from 'api/idea_json_form_schema/types';
import { IIdea } from 'api/ideas/types';

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
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    data &&
    data.location_description === initialFormData.location_description
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
  return Object.fromEntries(
    Object.keys(schema.properties).map((prop) => {
      if (prop === 'author_id') {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        return [prop, idea.data.relationships?.author?.data?.id];
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (idea.data.attributes?.[prop]) {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        return [prop, idea.data.attributes?.[prop]];
      } else if (
        prop === 'topic_ids' &&
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        Array.isArray(idea.data.relationships?.topics?.data)
      ) {
        return [
          prop,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          idea.data.relationships?.topics?.data.map((rel) => rel.id),
        ];
      } else if (
        prop === 'cosponsor_ids' &&
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        Array.isArray(idea.data.relationships?.cosponsors?.data)
      ) {
        return [
          prop,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          idea.data.relationships?.cosponsors?.data.map((rel) => rel.id),
        ];
      } else if (
        prop === 'idea_images_attributes' &&
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
