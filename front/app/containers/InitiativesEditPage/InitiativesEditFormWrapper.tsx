import React from 'react';
import clHistory from 'utils/cl-router/history';

// services
import { Locale } from 'typings';

// geoJson
import { parsePosition } from 'utils/locationTools';

import { IInitiativeImageData } from 'api/initiative_images/types';
import useAddInitiativeImage from 'api/initiative_images/useAddInitiativeImage';
import useDeleteInitiativeImage from 'api/initiative_images/useDeleteInitiativeImage';
import useAddInitiativeFile from 'api/initiative_files/useAddInitiativeFile';
import useDeleteInitiativeFile from 'api/initiative_files/useDeleteInitiativeFile';
import useUpdateInitiative from 'api/initiatives/useUpdateInitiative';
import { IInitiativeData } from 'api/initiatives/types';
import InitiativeForm, {
  FormValues as FormValues2,
} from 'components/InitiativeForm';
import { handleAddFiles, handleRemoveFiles } from 'api/initiative_files/util';
import { IInitiativeFiles } from 'api/initiative_files/types';

interface Props {
  locale: Locale;
  initiative: IInitiativeData;
  initiativeImage?: IInitiativeImageData;
  initiativeFiles?: IInitiativeFiles;
  onPublished: () => void;
}

const InitiativesEditFormWrapper = ({
  initiative,
  initiativeImage,
  initiativeFiles,
}: Props) => {
  const { mutate: addInitiativeImage } = useAddInitiativeImage();
  const { mutate: deleteInitiativeImage } = useDeleteInitiativeImage();
  const { mutateAsync: addInitiativeFile } = useAddInitiativeFile();
  const { mutateAsync: deleteInitiativeFile } = useDeleteInitiativeFile();
  const { mutate: updateInitiative } = useUpdateInitiative();

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
  }: FormValues2) => {
    const { location_description, location_point_geojson } =
      await parsePosition(position);

    updateInitiative(
      {
        initiativeId: initiative.id,
        requestBody: {
          title_multiloc,
          body_multiloc,
          ...(topic_ids && topic_ids.length > 0 && { topic_ids }),
          ...(cosponsor_ids && cosponsor_ids.length > 0 && { cosponsor_ids }),
          ...(location_description && { location_description }),
          ...(location_point_geojson && { location_point_geojson }),
          ...(header_bg?.[0]
            ? { header_bg: header_bg[0].base64 }
            : { header_bg: null }),
          ...(typeof anonymous === 'boolean' && { anonymous }),
        },
      },
      {
        onSuccess: (initiative) => {
          const initiativeId = initiative.data.id;

          if (local_initiative_files) {
            handleAddFiles(
              initiativeId,
              local_initiative_files,
              initiativeFiles?.data,
              addInitiativeFile
            );
            handleRemoveFiles(
              initiativeId,
              local_initiative_files,
              initiativeFiles?.data,
              deleteInitiativeFile
            );
          }

          // Id of current (saved) image
          const initiativeImageId = initiativeImage?.id;
          // File/blob in form state
          const imageInForm = images?.[0];
          const imageInFormNeedsSaving = imageInForm
            ? // If there's an image in the form but with no id, it means it's unsaved
              imageInForm.id === undefined
            : // If there's no image in the form, no saving is needed
              false;
          // We have an existing image (id verifies this) and we have either no image in the form (undefined) or
          // the image in the form has no id (undefined) which means it has not been saved
          const oldImageNeedsDeletion =
            typeof initiativeImageId === 'string' &&
            imageInForm?.id === undefined;

          // Needs to come before adding new image
          if (oldImageNeedsDeletion) {
            deleteInitiativeImage({
              initiativeId,
              imageId: initiativeImageId,
            });
          }

          if (images && imageInFormNeedsSaving) {
            addInitiativeImage({
              initiativeId,
              image: { image: images[0].base64 },
            });
          }

          clHistory.push({
            pathname: `/initiatives/${initiative.data.attributes.slug}`,
          });
        },
      }
    );
  };

  return (
    <InitiativeForm
      onSubmit={handleOnSubmit}
      initiative={initiative}
      initiativeImage={initiativeImage}
      initiativeFiles={initiativeFiles?.data}
    />
  );
};

export default InitiativesEditFormWrapper;
