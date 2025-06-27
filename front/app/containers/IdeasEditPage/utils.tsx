import { IIdeaFiles } from 'api/idea_files/types';
import { IIdeaImages } from 'api/idea_images/types';
import { JsonFormsSchema } from 'api/idea_json_form_schema/types';
import { IIdea } from 'api/ideas/types';

import { isNilOrError } from 'utils/helperUtils';

export const getFormValues = (
  idea: IIdea | undefined,
  schema: JsonFormsSchema | null,
  remoteImages?: IIdeaImages,
  remoteFiles?: IIdeaFiles
) => {
  if (!idea || !schema) return {};
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
