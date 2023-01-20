import React from 'react';
import styled from 'styled-components';

// components
import { SubSectionTitle } from 'components/admin/Section';
import { StyledSectionField } from './styling';
import ImagesDropzone from 'components/UI/ImagesDropzone';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// typings
import { UploadFile } from 'typings';
import ImageInfoTooltip from 'components/admin/ImageCropper/ImageInfoTooltip';

// Would have loved to put this in styling.ts, but
// that results in some arcane typescript error
// (see https://stackoverflow.com/q/43900035)
const StyledImagesDropzone = styled(ImagesDropzone)`
  margin-top: 2px;
`;

interface Props {
  projectImages: UploadFile[] | null;
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
      <ImageInfoTooltip />
    </SubSectionTitle>
    <StyledImagesDropzone
      images={projectImages}
      imagePreviewRatio={1 / 2}
      maxImagePreviewWidth="240px"
      acceptedFileTypes={{
        'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      }}
      onAdd={handleProjectImagesOnAdd}
      onRemove={handleProjectImageOnRemove}
    />
  </StyledSectionField>
);
