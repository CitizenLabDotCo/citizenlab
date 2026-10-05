import React from 'react';

import { Box, IconTooltip, Text } from '@citizenlab/cl2-component-library';
import { Multiloc, UploadFile } from 'typings';

import {
  CARD_IMAGE_ASPECT_RATIO_HEIGHT,
  CARD_IMAGE_ASPECT_RATIO_WIDTH,
} from 'api/project_images/useProjectImages';

import ProjectCardImageDropzone from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectCardImageDropzone';
import {
  StyledInputMultiloc,
  StyledSectionField,
} from 'containers/Admin/projects/_shared/components/ProjectSetupForm/styling';
import generalMessages from 'containers/Admin/projects/project/general/messages';

import ImageCropperContainer from 'components/admin/ImageCropper/Container';
import { SubSectionTitle } from 'components/admin/Section';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import ProjectTagsField from './ProjectTagsField';

interface Props {
  selectedTopicIds: string[];
  cardImage: UploadFile | null;
  cardImageAltText: Multiloc | null;
  cardImageShouldBeSaved: boolean;
  onTopicsChange: (topicIds: string[]) => void;
  onCardImageAdd: (images: UploadFile[]) => void;
  onCardImageRemove: (image: UploadFile) => void;
  onCardImageCropped: (base64: string) => void;
  onCardImageAltTextChange: (altText: Multiloc) => void;
}

const FrontOfficeSection = ({
  selectedTopicIds,
  cardImage,
  cardImageAltText,
  cardImageShouldBeSaved,
  onTopicsChange,
  onCardImageAdd,
  onCardImageRemove,
  onCardImageCropped,
  onCardImageAltTextChange,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box display="flex" flexDirection="column" gap="40px">
      <ProjectTagsField
        selectedTopicIds={selectedTopicIds}
        onChange={onTopicsChange}
      />

      <Box>
        <Text variant="boSection" mt="0px" mb="4px">
          {formatMessage(messages.settingsThumbnailTitle)}
        </Text>
        <Text variant="boHelper" mt="0px" mb="16px">
          {formatMessage(messages.settingsThumbnailDescription)}
        </Text>
        {cardImageShouldBeSaved ? (
          <ImageCropperContainer
            image={cardImage}
            onComplete={onCardImageCropped}
            aspectRatioWidth={CARD_IMAGE_ASPECT_RATIO_WIDTH}
            aspectRatioHeight={CARD_IMAGE_ASPECT_RATIO_HEIGHT}
            onRemove={() => cardImage && onCardImageRemove(cardImage)}
          />
        ) : (
          <ProjectCardImageDropzone
            images={cardImage && [cardImage]}
            onAddImages={onCardImageAdd}
            onRemoveImage={onCardImageRemove}
          />
        )}

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
              onChange={onCardImageAltTextChange}
            />
          </StyledSectionField>
        )}
      </Box>
    </Box>
  );
};

export default FrontOfficeSection;
