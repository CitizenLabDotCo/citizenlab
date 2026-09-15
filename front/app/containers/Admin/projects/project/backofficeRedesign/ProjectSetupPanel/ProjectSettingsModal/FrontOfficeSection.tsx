import React from 'react';

import { Box, IconTooltip } from '@citizenlab/cl2-component-library';
import { Multiloc, UploadFile } from 'typings';

import {
  CARD_IMAGE_ASPECT_RATIO_HEIGHT,
  CARD_IMAGE_ASPECT_RATIO_WIDTH,
} from 'api/project_images/useProjectImages';

import GeographicAreaInputs from 'containers/Admin/projects/_shared/components/ProjectSetupForm/GeographicAreaInputs';
import ProjectCardImageDropzone from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectCardImageDropzone';
import ProjectCardImageTooltip from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectCardImageTooltip';
import {
  StyledInputMultiloc,
  StyledSectionField,
} from 'containers/Admin/projects/_shared/components/ProjectSetupForm/styling';
import TopicInputs from 'containers/Admin/projects/_shared/components/ProjectSetupForm/TopicInputs';

import ImageCropperContainer from 'components/admin/ImageCropper/Container';
import { SubSectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';

import { TOnProjectAttributesDiffChangeFunction } from '../../../../general';
import generalMessages from '../../../../general/messages';

interface Props {
  selectedTopicIds: string[];
  areaIds: string[] | undefined;
  cardImage: UploadFile | null;
  cardImageAltText: Multiloc | null;
  cardImageShouldBeSaved: boolean;
  onTopicsChange: (topicIds: string[]) => void;
  onProjectAttributesDiffChange: TOnProjectAttributesDiffChangeFunction;
  onCardImageAdd: (images: UploadFile[]) => void;
  onCardImageRemove: (image: UploadFile) => void;
  onCardImageCropped: (base64: string) => void;
  onCardImageAltTextChange: (altText: Multiloc) => void;
}

const FrontOfficeSection = ({
  selectedTopicIds,
  areaIds,
  cardImage,
  cardImageAltText,
  cardImageShouldBeSaved,
  onTopicsChange,
  onProjectAttributesDiffChange,
  onCardImageAdd,
  onCardImageRemove,
  onCardImageCropped,
  onCardImageAltTextChange,
}: Props) => (
  <Box>
    <TopicInputs
      selectedTopicIds={selectedTopicIds}
      onChange={onTopicsChange}
    />

    <GeographicAreaInputs
      areaIds={areaIds}
      onProjectAttributesDiffChange={onProjectAttributesDiffChange}
    />

    <StyledSectionField>
      <SubSectionTitle>
        <FormattedMessage {...generalMessages.projectCardImageLabelText} />
        <ProjectCardImageTooltip />
      </SubSectionTitle>
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
          onChange={onCardImageAltTextChange}
        />
      </StyledSectionField>
    )}
  </Box>
);

export default FrontOfficeSection;
