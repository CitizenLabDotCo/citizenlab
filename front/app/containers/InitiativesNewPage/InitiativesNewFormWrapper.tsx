import React, { useState, useEffect } from 'react';

// components
import InitiativeForm, {
  FormValues,
  SimpleFormValues,
} from 'components/InitiativeForm';

import { Locale, Multiloc, UploadFile } from 'typings';

import { ITopicData } from 'api/topics/types';

// utils
import { isNilOrError } from 'utils/helperUtils';

// style
import { media } from 'utils/styleUtils';
import clHistory from 'utils/cl-router/history';
import styled from 'styled-components';

// intl
import { geocode } from 'utils/locationTools';
import { isEqual, pick, get, omitBy, isEmpty, debounce } from 'lodash-es';
import { Point } from 'geojson';

import { reportError } from 'utils/loggingUtils';

// tracks
import tracks from './tracks';
import { trackEventByName } from 'utils/analytics';

import useAddInitiative from 'api/initiatives/useAddInitiative';
import { IInitiativeAdd } from 'api/initiatives/types';
import useAddInitiativeImage from 'api/initiative_images/useAddInitiativeImage';
import useDeleteInitiativeImage from 'api/initiative_images/useDeleteInitiativeImage';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'hooks/useAuthUser';
import useUpdateInitiative from 'api/initiatives/useUpdateInitiative';
import useAddInitiativeFile from 'api/initiative_files/useAddInitiativeFile';
import useDeleteInitiativeFile from 'api/initiative_files/useDeleteInitiativeFile';

const StyledInitiativeForm = styled(InitiativeForm)`
  width: 100%;
  min-width: 530px;
  height: 900px;
  ${media.tablet`
    min-width: 230px;
  `}
`;

interface Props {
  locale: Locale;
  topics: ITopicData[];
  location_description?: string;
}

const InitiativesNewFormWrapper = ({
  topics,
  locale,
  location_description,
}: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  const { mutate: addInitiative } = useAddInitiative();
  const authUser = useAuthUser();
  const { mutate: addInitiativeImage, isLoading: isAdding } =
    useAddInitiativeImage();
  const { mutate: deleteInitiativeImage } = useDeleteInitiativeImage();
  const { mutate: addInitiativeFile } = useAddInitiativeFile();
  const { mutate: deleteInitiativeFile } = useDeleteInitiativeFile();
  const { mutate: updateInitiative, isLoading: isUpdating } =
    useUpdateInitiative();

  const initialValues = {
    title_multiloc: undefined,
    body_multiloc: undefined,
    topic_ids: [],
    position: location_description,
  };

  const [formValues, setFormValues] = useState<SimpleFormValues>(initialValues);
  const [image, setImage] = useState<UploadFile | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [hasBannerChanged, setHasBannerChanged] = useState<boolean>(false);
  const [banner, setBanner] = useState<UploadFile | null>(null);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [publishError, setPublishError] = useState<boolean>(false);
  const [apiErrors, setApiErrors] = useState<any>(null);
  const [titleProfanityError, setTitleProfanityError] =
    useState<boolean>(false);
  const [descriptionProfanityError, setDescriptionProfanityError] =
    useState<boolean>(false);
  const [initiativeId, setInitiativeId] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [hasImageChanged, setHasImageChanged] = useState<boolean>(false);

  useEffect(() => {
    addInitiative(
      { publication_status: 'draft' },
      { onSuccess: (initiative) => setInitiativeId(initiative.data.id) }
    );
  }, [addInitiative]);

  const getChangedValues = () => {
    const changedKeys = Object.keys(initialValues).filter((key) => {
      return !isEqual(initialValues[key], formValues[key]);
    });
    return pick(formValues, changedKeys);
  };

  const parsePosition = async (position: string | undefined | null) => {
    let location_point_geojson: Point | null | undefined;
    let location_description: string | null | undefined;
    switch (position) {
      case null:
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

  const getValuesToSend = async (
    changedValues: Partial<FormValues>,
    hasBannerChanged: boolean,
    banner: UploadFile | undefined | null
  ) => {
    // build API readable object
    const { title_multiloc, body_multiloc, topic_ids, position } =
      changedValues;

    const positionInfo = await parsePosition(position ?? location_description);
    // removes undefined values, not null values that are used to remove previously used values
    const formAPIValues = omitBy(
      {
        title_multiloc,
        body_multiloc,
        topic_ids,
        ...positionInfo,
      },
      (entry) => entry === undefined
    );

    if (hasBannerChanged) {
      formAPIValues.header_bg = banner ? banner.base64 : null;
    }
    return formAPIValues as Partial<IInitiativeAdd>;
  };

  const handleSave = async () => {
    const changedValues = getChangedValues();
    // if nothing has changed, do noting.
    if (isEmpty(changedValues) && !hasBannerChanged && !hasImageChanged) return;

    // if we're already publishing, do nothing.
    if (saving) return;

    // setting flags for user feedback and avoiding double sends.

    setSaving(true);

    try {
      const formAPIValues = await getValuesToSend(
        changedValues,
        hasBannerChanged,
        banner
      );
      // save any changes to the initiative data.
      if (!isEmpty(formAPIValues)) {
        if (initiativeId) {
          updateInitiative({
            initiativeId,
            requestBody: formAPIValues,
          });
        } else {
          addInitiative(
            {
              ...formAPIValues,
              publication_status: 'draft',
            },
            { onSuccess: (initiative) => setInitiativeId(initiative.data.id) }
          );
        }
        // feed back what was saved to the api into the initialValues object
        // so that we can determine with certainty what has changed since last
        // successful save.

        setHasBannerChanged(false);
      }

      // save any changes to initiative image.
      if (hasImageChanged && initiativeId) {
        if (image && image.base64) {
          addInitiativeImage(
            {
              initiativeId,
              image: { image: image.base64 },
            },
            {
              onSuccess: (data) => {
                setImageId(data.data.id);
              },
            }
          );
        } else if (!image && imageId) {
          deleteInitiativeImage(
            { initiativeId, imageId },
            {
              onSuccess: () => {
                setImageId(null);
              },
            }
          );
        } else {
          // Image saving mechanism works on the hypothesis that any defined
          // image will have a base64 key, and when you need to remove an image
          // it was previously saved. If not, let's report it so it gets fixed.
          reportError('There was an error with an initiative image');
        }

        setHasImageChanged(false);
      }
      setSaving(false);
    } catch (errorResponse) {
      // saving changes while working should have a minimal error feedback,
      // maybe in the saving indicator, since it's error-resistant, ie what wasn't
      // saved this time will be next time user leaves a field, or on publish call.
      setSaving(false);
    }
  };

  const debouncedSave = debounce(handleSave, 500);

  const handlePublish = async () => {
    const changedValues = getChangedValues();

    try {
      const formAPIValues = await getValuesToSend(
        changedValues,
        hasBannerChanged,
        banner
      );

      // save any changes to the initiative data.
      if (initiativeId) {
        updateInitiative(
          {
            initiativeId,
            requestBody: {
              ...formAPIValues,
              publication_status: 'published',
            },
          },
          {
            onSuccess: (initiative) => {
              clHistory.push({
                pathname: `/initiatives/${initiative.data.attributes.slug}`,
                search: `?new_initiative_id=${initiative.data.id}`,
              });
            },
          }
        );
      } else {
        addInitiative(
          {
            ...formAPIValues,
            publication_status: 'published',
          },
          { onSuccess: (initiative) => setInitiativeId(initiative.data.id) }
        );
      }

      setHasBannerChanged(false);
      // save any changes to initiative image.
      if (hasImageChanged && initiativeId) {
        if (image && image.base64) {
          addInitiativeImage(
            {
              initiativeId,
              image: { image: image.base64 },
            },
            {
              onSuccess: (data) => {
                setImageId(data.data.id);
              },
            }
          );

          // remove image from remote if it was saved
        } else if (!image && imageId) {
          deleteInitiativeImage(
            { initiativeId, imageId },
            {
              onSuccess: () => {
                setImageId(null);
              },
            }
          );
        } else if (image) {
          // Image saving mechanism works on the hypothesis that any defined
          // image will have a base64 key, if not, something wrong has happened.
          reportError('Unexpected state of initiative image');
        }

        setHasImageChanged(false);
      }
    } catch (errorResponse) {
      const apiErrors = get(errorResponse, 'json.errors');

      const profanityApiError = apiErrors.base.find(
        (apiError) => apiError.error === 'includes_banned_words'
      );

      if (profanityApiError) {
        const titleProfanityError = profanityApiError.blocked_words.some(
          (blockedWord) => blockedWord.attribute === 'title_multiloc'
        );
        const descriptionProfanityError = profanityApiError.blocked_words.some(
          (blockedWord) => blockedWord.attribute === 'body_multiloc'
        );

        if (titleProfanityError) {
          trackEventByName(tracks.titleProfanityError.name, {
            locale,
            profaneMessage: changedValues.title_multiloc?.[locale],
            proposalId: initiativeId,
            location: 'InitiativesNewFormWrapper (citizen side)',
            userId: !isNilOrError(authUser) ? authUser.id : null,
            host: !isNilOrError(appConfiguration)
              ? appConfiguration.data.attributes.host
              : null,
          });

          setTitleProfanityError(titleProfanityError);
        }

        if (descriptionProfanityError) {
          trackEventByName(tracks.descriptionProfanityError.name, {
            locale,
            profaneMessage: changedValues.body_multiloc?.[locale],
            proposalId: initiativeId,
            location: 'InitiativesNewFormWrapper (citizen side)',
            userId: !isNilOrError(authUser) ? authUser.id : null,
            host: !isNilOrError(appConfiguration)
              ? appConfiguration.data.attributes.host
              : null,
          });

          setDescriptionProfanityError(descriptionProfanityError);
        }
      }

      setApiErrors((oldApiErrors) => ({
        ...oldApiErrors,
        ...apiErrors,
      }));
      setPublishError(true);
    }
  };

  const onChangeTitle = (title_multiloc: Multiloc) => {
    setFormValues((formValues) => ({
      ...formValues,
      title_multiloc,
    }));
    setTitleProfanityError(false);
  };

  const onChangeBody = (body_multiloc: Multiloc) => {
    setFormValues((formValues) => ({
      ...formValues,
      body_multiloc,
    }));
    setDescriptionProfanityError(false);
  };

  const onChangeTopics = (topic_ids: string[]) => {
    setFormValues((formValues) => ({
      ...formValues,
      topic_ids,
    }));
  };

  const onChangePosition = (position: string) => {
    setFormValues((formValues) => ({
      ...formValues,
      position,
    }));
  };

  const onChangeBanner = (newValue: UploadFile | null) => {
    setBanner(newValue);
    setHasBannerChanged(true);
  };

  const onChangeImage = (newValue: UploadFile | null) => {
    if (newValue) {
      setImage(newValue);
      setHasImageChanged(true);
    }
  };

  const onAddFile = (file: UploadFile) => {
    if (initiativeId) {
      setSaving(true);

      addInitiativeFile(
        {
          initiativeId,
          file: { file: file.base64, name: file.name },
        },
        {
          onSuccess: () => {
            setSaving(false);
            setFiles((files) => [...files, file]);
          },
          onError: (errorResponse) => {
            const apiErrors = get(errorResponse, 'json.errors');

            setSaving(false);
            setApiErrors((oldApiErrors) => ({
              ...oldApiErrors,
              ...apiErrors,
            }));
            setTimeout(() => {
              setApiErrors((oldApiErrors) => ({
                ...oldApiErrors,
                file: undefined,
              }));
            }, 5000);
          },
        }
      );
    }
  };

  const onRemoveFile = (fileToRemove: UploadFile) => {
    if (initiativeId && fileToRemove.id) {
      setSaving(true);
      deleteInitiativeFile(
        { initiativeId, fileId: fileToRemove.id },
        {
          onSuccess: () => {
            setSaving(false);
            setFiles((files) =>
              [...files].filter((file) => file.base64 !== fileToRemove.base64)
            );
          },
        }
      );
    }
  };

  return (
    <StyledInitiativeForm
      onPublish={handlePublish}
      onSave={debouncedSave}
      locale={locale}
      {...formValues}
      image={image}
      banner={banner}
      files={files}
      apiErrors={apiErrors}
      publishError={publishError}
      publishing={isAdding && isUpdating}
      onChangeTitle={onChangeTitle}
      onChangeBody={onChangeBody}
      onChangeTopics={onChangeTopics}
      onChangePosition={onChangePosition}
      onChangeBanner={onChangeBanner}
      onChangeImage={onChangeImage}
      onAddFile={onAddFile}
      onRemoveFile={onRemoveFile}
      topics={topics}
      titleProfanityError={titleProfanityError}
      descriptionProfanityError={descriptionProfanityError}
    />
  );
};

export default InitiativesNewFormWrapper;
