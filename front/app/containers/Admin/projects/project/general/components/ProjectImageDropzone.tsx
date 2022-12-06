import React from 'react';
// components
import { IconTooltip } from '@citizenlab/cl2-component-library';
// typings
import { UploadFile } from 'typings';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { SubSectionTitle } from 'components/admin/Section';
import styled from 'styled-components';
import messages from '../messages';
import { StyledSectionField } from './styling';

// Would have loved to put this in styling.ts, but
// that results in some arcane typescript error
// (see https://stackoverflow.com/q/43900035)
const StyledImagesDropzone = styled(ImagesDropzone)`
  margin-top: 2px;
`;

interface Props {
  projectImages: UploadFile[];
  handleProjectImagesOnAdd: (projectImages: UploadFile[]) => void;
  handleProjectImageOnRemove: (projectImageToRemove: UploadFile) => void;
}

export default ({
  projectImages,
  handleProjectImagesOnAdd,
  handleProjectImageOnRemove,
}: Props) => (
  <StyledSectionField>
    <SubSectionTitle>
      <FormattedMessage {...messages.projectCardImageLabelText} />
      <IconTooltip
        content={
          <FormattedMessage {...messages.projectCardImageLabelTooltip} />
        }
      />
    </SubSectionTitle>
    <StyledImagesDropzone
      images={projectImages}
      imagePreviewRatio={960 / 1440}
      maxImagePreviewWidth="240px"
      acceptedFileTypes={{
        'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      }}
      onAdd={handleProjectImagesOnAdd}
      onRemove={handleProjectImageOnRemove}
    />
  </StyledSectionField>
);
