import React, { useCallback, useEffect, useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { Multiloc, UploadFile } from 'typings';

import useProjectImages, {
  CARD_IMAGE_ASPECT_RATIO,
  CARD_IMAGE_ASPECT_RATIO_HEIGHT,
  CARD_IMAGE_ASPECT_RATIO_WIDTH,
} from 'api/project_images/useProjectImages';
import { IProjectData } from 'api/projects/types';

import { StyledSectionField } from 'containers/Admin/projects/_shared/components/ProjectSetupForm/styling';

import ImagesDropzone from 'components/UI/ImagesDropzone';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import TextAreaMultilocWithLocaleSwitcher from 'components/UI/TextAreaMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';
import { convertUrlToUploadFile, isUploadFile } from 'utils/fileUtils';

import ImageCropModal from '../../Event/ImageCropModal';
import ImageFileRow from '../../Event/ImageFileRow';
import eventMessages from '../../Event/messages';
import messages from '../../messages';
import PanelSettings from '../../Phase/PanelSettings';
import { useSetupDraft } from '../SetupDraftContext';

interface Props {
  project: IProjectData;
}

const HomepageCardFields = ({ project }: Props) => {
  const projectId = project.id;
  const { formatMessage } = useIntl();
  const { data: remoteProjectImages } = useProjectImages(projectId);
  const { changes, imageChanges, changeProject, changeImage, resetImage } =
    useSetupDraft();

  const [savedImage, setSavedImage] = useState<UploadFile | null>(null);
  const [savedAltText, setSavedAltText] = useState<Multiloc | null>(null);
  const [cropOpened, setCropOpened] = useState(false);

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
    changeImage({ image: { file: images[0], cropped: images[0].base64 } });
    setCropOpened(true);
  };

  const cropImage = (cropped: string) => {
    if (pickedImage) {
      changeImage({ image: { file: pickedImage.file, cropped } });
    }
  };

  const removeImage = () => {
    if (savedImage) {
      changeImage({ image: null });
    } else {
      resetImage();
    }
  };

  return (
    <PanelSettings>
      <StyledSectionField>
        <Text as="p" m="0" mb="4px" fontSize="xs" color="coolGrey600">
          {formatMessage(messages.homepageCardImage)}
        </Text>
        {cardImage ? (
          <Box display="flex" flexDirection="column" gap="12px">
            <ImageFileRow
              image={cardImage}
              thumbnail={pickedImage?.cropped ?? cardImage.base64}
              onCrop={pickedImage ? () => setCropOpened(true) : undefined}
              onReplace={(image) => pickImage([image])}
              onRemove={removeImage}
              stackActions
            />
            <InputMultilocWithLocaleSwitcher
              id="homepage-card-image-alt-text"
              type="text"
              variant="bo"
              stackedLabel
              valueMultiloc={imageChanges.altText ?? savedAltText}
              label={formatMessage(eventMessages.altText)}
              placeholder={formatMessage(eventMessages.altTextPlaceholder)}
              onChange={(altText) => changeImage({ altText })}
            />
          </Box>
        ) : (
          <ImagesDropzone
            images={[]}
            imagePreviewRatio={1 / CARD_IMAGE_ASPECT_RATIO}
            acceptedFileTypes={{
              'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
            }}
            onAdd={pickImage}
            onRemove={removeImage}
            label={formatMessage(eventMessages.dropImage)}
            compact
          />
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
      </StyledSectionField>

      <StyledSectionField>
        <TextAreaMultilocWithLocaleSwitcher
          id="homepage-card-description"
          variant="bo"
          stackedLabel
          minRows={4}
          valueMultiloc={
            changes.description_preview_multiloc ??
            project.attributes.description_preview_multiloc
          }
          onChange={(description_preview_multiloc) =>
            changeProject({ description_preview_multiloc })
          }
          label={formatMessage(messages.homepageCardDescription)}
          placeholder={formatMessage(
            messages.homepageCardDescriptionPlaceholder
          )}
        />
      </StyledSectionField>
    </PanelSettings>
  );
};

export default HomepageCardFields;
