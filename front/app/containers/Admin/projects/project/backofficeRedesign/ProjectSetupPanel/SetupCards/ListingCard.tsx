import React, { useCallback, useEffect, useState } from 'react';

import { Box, Button, IconTooltip } from '@citizenlab/cl2-component-library';
import { Multiloc, UploadFile } from 'typings';

import useProjectImages, {
  CARD_IMAGE_ASPECT_RATIO_HEIGHT,
  CARD_IMAGE_ASPECT_RATIO_WIDTH,
} from 'api/project_images/useProjectImages';

import ProjectCardImageDropzone from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectCardImageDropzone';
import ProjectCardImageTooltip from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectCardImageTooltip';
import {
  StyledInputMultiloc,
  StyledSectionField,
} from 'containers/Admin/projects/_shared/components/ProjectSetupForm/styling';
import PanelGroup from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelGroup';
import useSyncProjectImages from 'containers/Admin/projects/_shared/useSyncProjectImages';
import generalMessages from 'containers/Admin/projects/project/general/messages';

import ImageCropperContainer from 'components/admin/ImageCropper/Container';
import { SubSectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { convertUrlToUploadFile, isUploadFile } from 'utils/fileUtils';

import messages from '../../messages';

interface Props {
  projectId: string;
}

const ListingCard = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: remoteProjectImages } = useProjectImages(projectId);
  const syncProjectImages = useSyncProjectImages();

  const [processing, setProcessing] = useState(false);
  const [cardImage, setCardImage] = useState<UploadFile | null>(null);
  const [cardImageAltText, setCardImageAltText] = useState<Multiloc | null>(
    null
  );
  const [cardImageToRemove, setCardImageToRemove] = useState<UploadFile | null>(
    null
  );
  const [croppedCardBase64, setCroppedCardBase64] = useState<string | null>(
    null
  );
  const [dirty, setDirty] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const loadRemoteCardImage = useCallback(async () => {
    setCardImage(null);
    setCardImageAltText(null);

    for (const projectImage of remoteProjectImages?.data ?? []) {
      const url = projectImage.attributes.versions.large;
      if (!url) continue;

      const uploadFile = await convertUrlToUploadFile(
        url,
        projectImage.id,
        null
      );
      if (isUploadFile(uploadFile)) {
        setCardImage(uploadFile);
        setCardImageAltText(projectImage.attributes.alt_text_multiloc);
        break;
      }
    }
  }, [remoteProjectImages]);

  useEffect(() => {
    loadRemoteCardImage();
  }, [loadRemoteCardImage]);

  const handleCardImageAdd = (images: UploadFile[]) => {
    setCardImage(images[0]);
    setCroppedCardBase64(images[0].base64);
    setDirty(true);
  };

  const handleCardImageRemove = (image: UploadFile) => {
    setCardImage(null);
    setCroppedCardBase64(null);
    if (image.remote) setCardImageToRemove(image);
    setDirty(true);
  };

  const handleAltTextChange = (altText: Multiloc) => {
    setCardImageAltText(altText);
    setDirty(true);
  };

  const handleSave = async () => {
    setProcessing(true);
    setSaveFailed(false);
    try {
      await syncProjectImages({
        croppedProjectCardBase64: croppedCardBase64,
        projectCardImageAltText: cardImageAltText,
        projectCardImageToUpdate: cardImage,
        projectCardImageToRemove: cardImageToRemove,
        projectId,
      });
      setCardImageToRemove(null);
      setCroppedCardBase64(null);
      setDirty(false);
    } catch {
      setSaveFailed(true);
    } finally {
      setProcessing(false);
    }
  };

  const cardImageShouldBeSaved = cardImage ? !cardImage.remote : false;

  return (
    <PanelGroup label={formatMessage(messages.listing)}>
      <StyledSectionField>
        <SubSectionTitle>
          <FormattedMessage {...generalMessages.projectCardImageLabelText} />
          <ProjectCardImageTooltip />
        </SubSectionTitle>
        {cardImageShouldBeSaved ? (
          <ImageCropperContainer
            image={cardImage}
            onComplete={setCroppedCardBase64}
            aspectRatioWidth={CARD_IMAGE_ASPECT_RATIO_WIDTH}
            aspectRatioHeight={CARD_IMAGE_ASPECT_RATIO_HEIGHT}
            onRemove={() => cardImage && handleCardImageRemove(cardImage)}
          />
        ) : (
          <ProjectCardImageDropzone
            images={cardImage && [cardImage]}
            onAddImages={handleCardImageAdd}
            onRemoveImage={handleCardImageRemove}
          />
        )}
      </StyledSectionField>

      {cardImage && (
        <StyledSectionField>
          <SubSectionTitle>
            <FormattedMessage {...generalMessages.projectImageAltTextTitle} />
            <IconTooltip
              content={
                <FormattedMessage
                  {...generalMessages.projectImageAltTextTooltip}
                />
              }
            />
          </SubSectionTitle>
          <StyledInputMultiloc
            type="text"
            valueMultiloc={cardImageAltText}
            label={<FormattedMessage {...generalMessages.altText} />}
            onChange={handleAltTextChange}
          />
        </StyledSectionField>
      )}

      <Box display="flex">
        <Button
          buttonStyle="bo-primary"
          width="auto"
          processing={processing}
          disabled={!dirty}
          onClick={handleSave}
        >
          {formatMessage(messages.settingsSaveChanges)}
        </Button>
      </Box>
      {saveFailed && (
        <Error text={formatMessage(generalMessages.saveErrorMessage)} />
      )}
    </PanelGroup>
  );
};

export default ListingCard;
