import React, { useCallback, useEffect, useState } from 'react';

import { Multiloc, UploadFile } from 'typings';

import Banner from 'design-system/Banner';
import DropZone from 'design-system/DropZone';
import TextArea from 'design-system/TextArea';

import useProjectImages, {
  CARD_IMAGE_ASPECT_RATIO_HEIGHT,
  CARD_IMAGE_ASPECT_RATIO_WIDTH,
} from 'api/project_images/useProjectImages';
import { IProjectData } from 'api/projects/types';

import ImageCropModal from 'containers/Admin/projects/project/backofficeRedesign/Event/ImageCropModal';
import ImageFileRow from 'containers/Admin/projects/project/backofficeRedesign/Event/ImageFileRow';
import {
  isImageTooLarge,
  MAX_IMAGE_FILE_SIZE_MB,
  toUploadFile,
} from 'containers/Admin/projects/project/backofficeRedesign/Event/imageUpload';
import eventMessages from 'containers/Admin/projects/project/backofficeRedesign/Event/messages';

import LocaleSwitcher from 'components/admin/MultilocFields/LocaleSwitcher';
import MultilocTextField from 'components/admin/MultilocFields/MultilocTextField';
import useSelectedLocale from 'components/admin/MultilocFields/useSelectedLocale';
import imagesDropzoneMessages from 'components/UI/ImagesDropzone/messages';

import { useIntl } from 'utils/cl-intl';
import { convertUrlToUploadFile, isUploadFile } from 'utils/fileUtils';

import { useSetupDraft } from '../SetupDraftContext';

import styles from './HomepageCardFields.module.css';
import messages from './messages';

interface Props {
  project: IProjectData;
}

// The card image types the old dropzone accepted.
const ACCEPTED_CARD_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

const HomepageCardFields = ({ project }: Props) => {
  const projectId = project.id;
  const { formatMessage } = useIntl();
  const { data: remoteProjectImages } = useProjectImages(projectId);
  const { values, imageChanges, changeProject, changeImage, resetImage } =
    useSetupDraft();

  const [savedImage, setSavedImage] = useState<UploadFile | null>(null);
  const [savedAltText, setSavedAltText] = useState<Multiloc | null>(null);
  const [cropOpened, setCropOpened] = useState(false);
  const [imageTooLarge, setImageTooLarge] = useState(false);
  const {
    locales,
    selectedLocale: descriptionLocale,
    setSelectedLocale: setDescriptionLocale,
  } = useSelectedLocale();

  const loadRemoteCardImage = useCallback(async () => {
    setSavedImage(null);
    setSavedAltText(null);

    for (const projectImage of remoteProjectImages?.data ?? []) {
      const url = projectImage.attributes.versions.large;
      if (!url) continue;

      const uploadFile = await convertUrlToUploadFile(
        url,
        projectImage.id,
        null
      );
      if (isUploadFile(uploadFile)) {
        setSavedImage(uploadFile);
        setSavedAltText(projectImage.attributes.alt_text_multiloc);
        break;
      }
    }
  }, [remoteProjectImages]);

  useEffect(() => {
    loadRemoteCardImage();
  }, [loadRemoteCardImage]);

  const pickedImage = imageChanges.image;
  const cardImage =
    pickedImage === undefined ? savedImage : pickedImage?.file ?? null;

  const pickImage = (images: UploadFile[]) => {
    changeImage('image', { file: images[0], cropped: images[0].base64 });
    if (imageChanges.altText === undefined && savedAltText) {
      changeImage('altText', savedAltText);
    }
    setCropOpened(true);
  };

  const cropImage = (cropped: string) => {
    if (pickedImage) {
      changeImage('image', { file: pickedImage.file, cropped });
    }
  };

  const selectImage = async (files: File[]) => {
    if (files.length === 0) return;
    const [file] = files;

    const isTooLarge = isImageTooLarge(file);
    setImageTooLarge(isTooLarge);
    if (isTooLarge) return;

    pickImage([await toUploadFile(file)]);
  };

  const removeImage = () => {
    if (savedImage) {
      changeImage('image', null);
    } else {
      resetImage();
    }
  };

  if (!descriptionLocale) return null;

  const altText = imageChanges.altText ?? savedAltText;
  const description = values.description_preview_multiloc;

  return (
    <div>
      <div className={styles.field}>
        <p className={styles.imageLabel}>
          {formatMessage(messages.homepageCardImage)}
        </p>
        {cardImage ? (
          <div className={styles.imageFields}>
            <ImageFileRow
              image={cardImage}
              thumbnail={pickedImage?.cropped ?? cardImage.base64}
              onCrop={pickedImage ? () => setCropOpened(true) : undefined}
              onReplace={(image) => pickImage([image])}
              onRemove={removeImage}
              stackActions
            />
            <MultilocTextField
              id="homepage-card-image-alt-text"
              label={formatMessage(eventMessages.altText)}
              placeholder={formatMessage(eventMessages.altTextPlaceholder)}
              valueMultiloc={altText}
              onChange={(altText) => changeImage('altText', altText)}
            />
          </div>
        ) : (
          <>
            <DropZone
              aria-label={formatMessage(eventMessages.dropImage)}
              acceptedFileTypes={ACCEPTED_CARD_IMAGE_TYPES}
              onSelect={selectImage}
            />
            {imageTooLarge && (
              <Banner tone="error">
                {formatMessage(
                  imagesDropzoneMessages.errorImageMaxSizeExceeded,
                  {
                    maxFileSize: MAX_IMAGE_FILE_SIZE_MB,
                  }
                )}
              </Banner>
            )}
          </>
        )}
        <ImageCropModal
          opened={cropOpened && !!pickedImage}
          image={cardImage}
          aspectRatioWidth={CARD_IMAGE_ASPECT_RATIO_WIDTH}
          aspectRatioHeight={CARD_IMAGE_ASPECT_RATIO_HEIGHT}
          onCrop={cropImage}
          onRemove={resetImage}
          onClose={() => setCropOpened(false)}
        />
      </div>

      <div className={`${styles.field} ${styles.multiloc}`}>
        {locales.length > 1 && (
          <div className={styles.localeSwitch}>
            <LocaleSwitcher
              aria-label={formatMessage(messages.homepageCardDescription)}
              locales={locales}
              selectedLocale={descriptionLocale}
              onChange={setDescriptionLocale}
              valueMultiloc={description}
            />
          </div>
        )}
        <TextArea
          id="homepage-card-description"
          label={formatMessage(messages.homepageCardDescription)}
          placeholder={formatMessage(
            messages.homepageCardDescriptionPlaceholder
          )}
          value={description[descriptionLocale] ?? ''}
          onChange={(value) =>
            changeProject('description_preview_multiloc', {
              ...description,
              [descriptionLocale]: value,
            })
          }
        />
      </div>
    </div>
  );
};

export default HomepageCardFields;
