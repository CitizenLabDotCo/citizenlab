import React, { useState } from 'react';

// components
import InitiativeForm2, {
  FormValues as FormValues2,
} from 'components/InitiativeForm/InitiativeForm2';

// types
import { Locale, UploadFile } from 'typings';

// utils
import { isNilOrError } from 'utils/helperUtils';

// style
import { media } from 'utils/styleUtils';
import clHistory from 'utils/cl-router/history';

// intl
import { geocode } from 'utils/locationTools';
import { isEqual, pick, get, omitBy, isEmpty, debounce } from 'lodash-es';
import { Point } from 'geojson';

// tracks
import tracks from './tracks';
import { trackEventByName } from 'utils/analytics';

// api
import useAddInitiative from 'api/initiatives/useAddInitiative';
import { IInitiativeAdd } from 'api/initiatives/types';
import useAddInitiativeImage from 'api/initiative_images/useAddInitiativeImage';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';
import useUpdateInitiative from 'api/initiatives/useUpdateInitiative';
import useAddInitiativeFile from 'api/initiative_files/useAddInitiativeFile';
import useDeleteInitiativeFile from 'api/initiative_files/useDeleteInitiativeFile';
import { MentionItem } from 'react-mentions';

interface Props {
  locale: Locale;
  location_description?: string;
}

const InitiativesNewFormWrapper = ({ locale, location_description }: Props) => {
  const { mutate: addInitiative } = useAddInitiative();
  const { data: authUser } = useAuthUser();
  const {
    mutateAsync: addInitiativeImage,
    isLoading: isAddingInitiativeImage,
  } = useAddInitiativeImage();
  const { mutate: addInitiativeFile } = useAddInitiativeFile();

  const [postAnonymously, setPostAnonymously] = useState(false);
  const [publishError, setPublishError] = useState<boolean>(false);
  const [apiErrors, setApiErrors] = useState<any>(null);
  const [titleProfanityError, setTitleProfanityError] =
    useState<boolean>(false);
  const [descriptionProfanityError, setDescriptionProfanityError] =
    useState<boolean>(false);
  const [initiativeId, setInitiativeId] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

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

  // const handlePublish = async () => {
  //   // if we're already saving, do nothing.
  //   if (saving) return;

  //   // setting flags for user feedback and avoiding double sends.
  //   setSaving(true);

  //   if (allowAnonymousParticipation && postAnonymously) {
  //     setShowAnonymousConfirmationModal(true);
  //   } else {
  //     continuePublish();
  //   }
  // };

  // const continuePublish = async () => {
  //   const changedValues = getChangedValues();

  //   if (saving) return;

  //   try {
  //     const formAPIValues = await getValuesToSend(changedValues, banner);
  //     console.log(formAPIValues);

  //     // save any changes to the initiative data.
  //     if (initiativeId) {
  //       await updateInitiative(
  //         {
  //           initiativeId,
  //           requestBody: {
  //             ...formAPIValues,
  //             anonymous: postAnonymously,
  //             publication_status: 'published',
  //           },
  //         },
  //         {
  //           onSuccess: (initiative) => {
  //             clHistory.push({
  //               pathname: `/initiatives/${initiative.data.attributes.slug}`,
  //               search: `?new_initiative_id=${initiative.data.id}`,
  //             });
  //           },
  //         }
  //       );
  //     } else {
  //       // addInitiative(
  //       //   {
  //       //     ...formAPIValues,
  //       //     publication_status: 'published',
  //       //     anonymous: postAnonymously,
  //       //   },
  //       //   {
  //       //     onSuccess: (initiative) => setInitiativeId(initiative.data.id),
  //       //   }
  //       // );
  //     }
  //     setSaving(false);
  //   } catch (errorResponse) {
  //     const apiErrors = get(errorResponse, 'errors');

  //     const profanityApiError = apiErrors.base.find(
  //       (apiError) => apiError.error === 'includes_banned_words'
  //     );

  //     if (profanityApiError) {
  //       const titleProfanityError = profanityApiError.blocked_words.some(
  //         (blockedWord) => blockedWord.attribute === 'title_multiloc'
  //       );
  //       const descriptionProfanityError = profanityApiError.blocked_words.some(
  //         (blockedWord) => blockedWord.attribute === 'body_multiloc'
  //       );

  //       if (titleProfanityError) {
  //         trackEventByName(tracks.titleProfanityError.name, {
  //           locale,
  //           profaneMessage: changedValues.title_multiloc?.[locale],
  //           proposalId: initiativeId,
  //           location: 'InitiativesNewFormWrapper (citizen side)',
  //           userId: !isNilOrError(authUser) ? authUser.data.id : null,
  //           host: !isNilOrError(appConfiguration)
  //             ? appConfiguration.data.attributes.host
  //             : null,
  //         });

  //         setTitleProfanityError(titleProfanityError);
  //       }

  //       if (descriptionProfanityError) {
  //         trackEventByName(tracks.descriptionProfanityError.name, {
  //           locale,
  //           profaneMessage: changedValues.body_multiloc?.[locale],
  //           proposalId: initiativeId,
  //           location: 'InitiativesNewFormWrapper (citizen side)',
  //           userId: !isNilOrError(authUser) ? authUser.data.id : null,
  //           host: !isNilOrError(appConfiguration)
  //             ? appConfiguration.data.attributes.host
  //             : null,
  //         });

  //         setDescriptionProfanityError(descriptionProfanityError);
  //       }
  //     }

  //     setApiErrors((oldApiErrors) => ({
  //       ...oldApiErrors,
  //       ...apiErrors,
  //     }));
  //     setPublishError(true);
  //   }
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
  }: FormValues2) => {
    const { location_description, location_point_geojson } =
      await parsePosition(position);

    addInitiative(
      {
        publication_status: 'published',
        title_multiloc,
        body_multiloc,
        ...(topic_ids && topic_ids.length > 0 && { topic_ids }),
        ...(cosponsor_ids && cosponsor_ids.length > 0 && { cosponsor_ids }),
        ...(location_description && { location_description }),
        ...(location_point_geojson && { location_point_geojson }),
        ...(header_bg?.[0] && { header_bg: header_bg[0].base64 }),
      },
      {
        onSuccess: async (initiative) => {
          const initiativeId = initiative.data.id;

          if (local_initiative_files) {
            local_initiative_files.map((file) => {
              addInitiativeFile({
                initiativeId,
                file: { file: file.base64, name: file.name },
              });
            });
          }

          if (images?.[0]) {
            await addInitiativeImage({
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

  return <InitiativeForm2 onSubmit={handleOnSubmit} />;
};

export default InitiativesNewFormWrapper;
