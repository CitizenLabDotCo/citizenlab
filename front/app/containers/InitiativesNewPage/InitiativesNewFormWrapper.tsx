import React from 'react';
import { ILocationInfo } from 'typings';

// components
import InitiativeForm, { FormValues } from 'components/InitiativeForm';

// style
import clHistory from 'utils/cl-router/history';

// intl
import { parsePosition } from 'utils/locationTools';

// api
import useAddInitiative from 'api/initiatives/useAddInitiative';
import useAddInitiativeImage from 'api/initiative_images/useAddInitiativeImage';
import useAddInitiativeFile from 'api/initiative_files/useAddInitiativeFile';

interface Props {
  locationInfo: ILocationInfo | null;
}

const InitiativesNewFormWrapper = (_props: Props) => {
  const { mutateAsync: addInitiative } = useAddInitiative();
  const { mutate: addInitiativeImage } = useAddInitiativeImage();
  const { mutate: addInitiativeFile } = useAddInitiativeFile();

  const handleOnSubmit = async ({
    position,
    title_multiloc,
    body_multiloc,
    topic_ids,
    cosponsor_ids,
    local_initiative_files,
    images,
    header_bg,
    anonymous,
  }: FormValues) => {
    const { location_description, location_point_geojson } =
      await parsePosition(position);

    await addInitiative(
      {
        publication_status: 'published',
        title_multiloc,
        body_multiloc,
        ...(topic_ids && topic_ids.length > 0 && { topic_ids }),
        ...(cosponsor_ids && cosponsor_ids.length > 0 && { cosponsor_ids }),
        ...(location_description && { location_description }),
        ...(location_point_geojson && { location_point_geojson }),
        ...(header_bg?.[0] && { header_bg: header_bg[0].base64 }),
        ...(typeof anonymous === 'boolean' && { anonymous }),
      },
      {
        onSuccess: async (initiative) => {
          const initiativeId = initiative.data.id;

          if (local_initiative_files) {
            local_initiative_files.map(async (file) => {
              addInitiativeFile({
                initiativeId,
                file: { file: file.base64, name: file.name },
              });
            });
          }

          if (images?.[0]) {
            addInitiativeImage({
              initiativeId,
              image: { image: images[0].base64 },
            });
          }

          clHistory.push({
            pathname: `/initiatives/${initiative.data.attributes.slug}`,
            search: `?new_initiative_id=${initiative.data.id}`,
          });
        },
      }
    );
  };

  return <InitiativeForm onSubmit={handleOnSubmit} />;
};

export default InitiativesNewFormWrapper;
