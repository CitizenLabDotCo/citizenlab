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
import InitiativeForm2, {
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
  const { mutateAsync: addInitiativeImage } = useAddInitiativeImage();
  const { mutateAsync: deleteInitiativeImage } = useDeleteInitiativeImage();
  const { mutateAsync: addInitiativeFile } = useAddInitiativeFile();
  const { mutateAsync: deleteInitiativeFile } = useDeleteInitiativeFile();
  const { mutate: updateInitiative } = useUpdateInitiative();

  // const continuePublish = async () => {
  //   const changedValues = getChangedValues();

  //   // if we're already saving, do nothing.
  //   if (publishing) return;

  //   // setting flags for user feedback and avoiding double sends.
  //   setPublishing(true);

  //   try {
  //     const formAPIValues = await getValuesToSend(
  //       changedValues,
  //       hasBannerChanged,
  //       banner
  //     );

  //     updateInitiative({
  //       initiativeId: initiative.id,
  //       requestBody: {
  //         ...formAPIValues,
  //         anonymous: postAnonymously,
  //         publication_status: 'published',
  //       },
  //     });

  //     // feed back what was saved to the api into the initialValues object
  //     // so that we can determine with certainty what has changed since last
  //     // successful save.

  //     setHasBannerChanged(false);

  //     // save any changes to initiative image.
  //     if (image && image.base64 && !image.id) {
  //       addInitiativeImage({
  //         initiativeId: initiative.id,
  //         image: { image: image.base64 },
  //       });
  //     }
  //     if (oldImageId) {
  //       deleteInitiativeImage(
  //         { initiativeId: initiative.id, imageId: oldImageId },
  //         {
  //           onSuccess: () => {
  //             setOldImageId(null);
  //           },
  //         }
  //       );
  //     }

  //     // saves changes to files
  //     filesToRemove.map((file) => {
  //       deleteInitiativeFile(
  //         { initiativeId: initiative.id, fileId: file.id as string },
  //         {
  //           onError: (errorResponse) => {
  //             const apiErrors = get(errorResponse, 'errors');

  //             setApiErrors((oldApiErrors) => ({
  //               ...oldApiErrors,
  //               ...apiErrors,
  //             }));

  //             setTimeout(() => {
  //               setApiErrors((oldApiErrors) => ({
  //                 ...oldApiErrors,
  //                 file: undefined,
  //               }));
  //             }, 5000);
  //           },
  //         }
  //       );
  //     });
  //     files.map((file) => {
  //       if (!file.id) {
  //         addInitiativeFile(
  //           {
  //             initiativeId: initiative.id,
  //             file: { file: file.base64, name: file.name },
  //           },
  //           {
  //             onSuccess: (res) => {
  //               file.id = res.data.id;
  //             },
  //             onError: (errorResponse) => {
  //               const apiErrors = get(errorResponse, 'errors');

  //               setApiErrors((oldApiErrors) => ({
  //                 ...oldApiErrors,
  //                 ...apiErrors,
  //               }));
  //               setTimeout(() => {
  //                 setApiErrors((oldApiErrors) => ({
  //                   ...oldApiErrors,
  //                   file: undefined,
  //                 }));
  //               }, 5000);
  //             },
  //           }
  //         );
  //       }
  //     });

  //     onPublished();
  // } catch (errorResponse) {
  //   const apiErrors = get(errorResponse, 'errors');

  //   setApiErrors((oldApiErrors) => ({ ...oldApiErrors, ...apiErrors }));
  //   setPublishError(true);
  //   const profanityApiError = apiErrors.base.find(
  //     (apiError) => apiError.error === 'includes_banned_words'
  //   );

  //   if (profanityApiError) {
  //     const titleProfanityError = profanityApiError.blocked_words.some(
  //       (blockedWord) => blockedWord.attribute === 'title_multiloc'
  //     );
  //     const descriptionProfanityError = profanityApiError.blocked_words.some(
  //       (blockedWord) => blockedWord.attribute === 'body_multiloc'
  //     );

  //     if (titleProfanityError) {
  //       trackEventByName(tracks.titleProfanityError.name, {
  //         locale,
  //         profaneMessage: changedValues.title_multiloc?.[locale],
  //         proposalId: initiative.id,
  //         location: 'InitiativesEditFormWrapper (citizen side)',
  //         userId: !isNilOrError(authUser) ? authUser.data.id : null,
  //         host: !isNilOrError(appConfiguration)
  //           ? appConfiguration.data.attributes.host
  //           : null,
  //       });

  //       setTitleProfanityError(titleProfanityError);
  //     }

  //     if (descriptionProfanityError) {
  //       trackEventByName(tracks.descriptionProfanityError.name, {
  //         locale,
  //         profaneMessage: changedValues.body_multiloc?.[locale],
  //         proposalId: initiative.id,
  //         location: 'InitiativesEditFormWrapper (citizen side)',
  //         userId: !isNilOrError(authUser) ? authUser.data.id : null,
  //         host: !isNilOrError(appConfiguration)
  //           ? appConfiguration.data.attributes.host
  //           : null,
  //       });

  //       setDescriptionProfanityError(descriptionProfanityError);
  //     }
  //   }
  // }
  //   setPublishing(false);
  // };

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
          ...(header_bg?.[0] && { header_bg: header_bg[0].base64 }),
          ...(typeof anonymous === 'boolean' && { anonymous }),
        },
      },
      {
        onSuccess: async (initiative) => {
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
            ? imageInForm.id === undefined
            : false;
          // We have an existing image (id verifies this) and we have either no image in the form (undefined) or
          // the image in the form has no id (undefined) which means it has not been saved
          const oldImageNeedsDeletion =
            typeof initiativeImageId === 'string' &&
            imageInForm?.id === undefined;

          // Needs to come before adding new image
          if (oldImageNeedsDeletion) {
            await deleteInitiativeImage({
              initiativeId,
              imageId: initiativeImageId,
            });
          }

          if (images && imageInFormNeedsSaving) {
            await addInitiativeImage({
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
    <InitiativeForm2
      onSubmit={handleOnSubmit}
      initiative={initiative}
      initiativeImage={initiativeImage}
      initiativeFiles={initiativeFiles?.data}
    />
  );
};

export default InitiativesEditFormWrapper;
