import React, { useEffect, useState } from 'react';
// components
import InitiativeForm, {
  FormValues,
  SimpleFormValues,
} from 'components/InitiativeForm';

// services
import { Locale, Multiloc, UploadFile } from 'typings';
import { ITopicData } from 'api/topics/types';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { isEqual, pick, get, omitBy } from 'lodash-es';
import { convertUrlToUploadFile } from 'utils/fileUtils';

// geoJson
import { geocode } from 'utils/locationTools';
import { Point } from 'geojson';

// tracks
import tracks from './tracks';
import { trackEventByName } from 'utils/analytics';

import { IInitiativeImageData } from 'api/initiative_images/types';
import useAddInitiativeImage from 'api/initiative_images/useAddInitiativeImage';
import useDeleteInitiativeImage from 'api/initiative_images/useDeleteInitiativeImage';
import useAuthUser from 'hooks/useAuthUser';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAddInitiativeFile from 'api/initiative_files/useAddInitiativeFile';
import useDeleteInitiativeFile from 'api/initiative_files/useDeleteInitiativeFile';
import useUpdateInitiative from 'api/initiatives/useUpdateInitiative';
import { IInitiativeAdd, IInitiativeData } from 'api/initiatives/types';

interface Props {
  locale: Locale;
  initiative: IInitiativeData;
  initiativeImage: IInitiativeImageData | null;
  initiativeFiles: UploadFile[] | null;
  onPublished: () => void;
  topics: ITopicData[];
}

function doNothing() {
  return;
}

const InitiativesEditFormWrapper = ({
  initiative,
  initiativeImage,
  onPublished,
  locale,
  topics,
  initiativeFiles,
}: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  const authUser = useAuthUser();
  const { mutate: addInitiativeImage } = useAddInitiativeImage();
  const { mutate: deleteInitiativeImage } = useDeleteInitiativeImage();
  const { mutate: addInitiativeFile } = useAddInitiativeFile();
  const { mutate: deleteInitiativeFile } = useDeleteInitiativeFile();
  const { mutate: updateInitiative } = useUpdateInitiative();

  const initialValues = {
    title_multiloc: initiative.attributes.title_multiloc,
    body_multiloc: initiative.attributes.body_multiloc,
    position: initiative.attributes.location_description,
    topic_ids: initiative.relationships.topics.data.map((topic) => topic.id),
  };

  const [formValues, setFormValues] = useState<SimpleFormValues>(initialValues);

  const [oldImageId, setOldImageId] = useState<string | null>(null);
  const [image, setImage] = useState<UploadFile | null>(null);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [hasBannerChanged, setHasBannerChanged] = useState<boolean>(false);
  const [banner, setBanner] = useState<UploadFile | null>(null);
  const [files, setFiles] = useState<UploadFile[]>(initiativeFiles || []);
  const [publishError, setPublishError] = useState<boolean>(false);
  const [apiErrors, setApiErrors] = useState<any>(null);
  const [filesToRemove, setFilesToRemove] = useState<UploadFile[]>([]);
  const [titleProfanityError, setTitleProfanityError] =
    useState<boolean>(false);
  const [descriptionProfanityError, setDescriptionProfanityError] =
    useState<boolean>(false);

  useEffect(() => {
    if (initiativeFiles) {
      setFiles(initiativeFiles);
    }
  }, [initiativeFiles]);

  useEffect(() => {
    if (initiativeImage && initiativeImage.attributes.versions.large) {
      const url = initiativeImage.attributes.versions.large;
      const id = initiativeImage.id;
      convertUrlToUploadFile(url, id, null).then((image) => {
        setImage(image);
      });
    }
    if (initiative && initiative.attributes.header_bg.large) {
      const url = initiative.attributes.header_bg.large;
      convertUrlToUploadFile(url, null, null).then((banner) => {
        setBanner(banner);
      });
    }
  }, [initiative, initiativeImage]);

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
    const positionInfo = await parsePosition(position);

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

  const handlePublish = async () => {
    const changedValues = getChangedValues();

    // if we're already saving, do nothing.
    if (publishing) return;

    // setting flags for user feedback and avoiding double sends.
    setPublishing(true);

    try {
      const formAPIValues = await getValuesToSend(
        changedValues,
        hasBannerChanged,
        banner
      );

      updateInitiative({
        initiativeId: initiative.id,
        requestBody: {
          ...formAPIValues,
          publication_status: 'published',
        },
      });

      // feed back what was saved to the api into the initialValues object
      // so that we can determine with certainty what has changed since last
      // successful save.

      setHasBannerChanged(false);

      // save any changes to initiative image.
      if (image && image.base64 && !image.id) {
        addInitiativeImage({
          initiativeId: initiative.id,
          image: { image: image.base64 },
        });
      }
      if (oldImageId) {
        deleteInitiativeImage(
          { initiativeId: initiative.id, imageId: oldImageId },
          {
            onSuccess: () => {
              setOldImageId(null);
            },
          }
        );
      }

      // saves changes to files
      filesToRemove.map((file) => {
        deleteInitiativeFile(
          { initiativeId: initiative.id, fileId: file.id as string },
          {
            onError: (errorResponse) => {
              const apiErrors = get(errorResponse, 'json.errors');

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
      });
      files.map((file) => {
        if (!file.id) {
          addInitiativeFile(
            {
              initiativeId: initiative.id,
              file: { file: file.base64, name: file.name },
            },
            {
              onSuccess: (res) => {
                file.id = res.data.id;
              },
              onError: (errorResponse) => {
                const apiErrors = get(errorResponse, 'json.errors');

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
      });

      onPublished();
    } catch (errorResponse) {
      const apiErrors = get(errorResponse, 'json.errors');

      setApiErrors((oldApiErrors) => ({ ...oldApiErrors, ...apiErrors }));
      setPublishError(true);
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
            proposalId: initiative.id,
            location: 'InitiativesEditFormWrapper (citizen side)',
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
            proposalId: initiative.id,
            location: 'InitiativesEditFormWrapper (citizen side)',
            userId: !isNilOrError(authUser) ? authUser.id : null,
            host: !isNilOrError(appConfiguration)
              ? appConfiguration.data.attributes.host
              : null,
          });

          setDescriptionProfanityError(descriptionProfanityError);
        }
      }
    }
    setPublishing(false);
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
    } else {
      const currentImageId = image?.id;
      if (currentImageId) {
        setImage(newValue);
        setOldImageId(currentImageId);
      } else {
        setImage(newValue);
      }
    }
  };

  const onAddFile = (file: UploadFile) => {
    setFiles((files) => [...files, file]);
  };

  const onRemoveFile = (fileToRemove: UploadFile) => {
    setFiles((files) =>
      [...files].filter((file) => file.base64 !== fileToRemove.base64)
    );
    if (fileToRemove.id) {
      setFilesToRemove((filesToRemove) => [...filesToRemove, fileToRemove]);
    }
  };

  if (image === undefined && initiativeImage) return null;

  return (
    <InitiativeForm
      onPublish={handlePublish}
      onSave={doNothing}
      locale={locale}
      {...formValues}
      image={image}
      banner={banner}
      files={files}
      publishing={publishing}
      publishError={publishError}
      apiErrors={apiErrors}
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

export default InitiativesEditFormWrapper;
