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
import { HEADER_BG_ASPECT_RATIO } from 'services/projects';
import ImageInfoTooltip from 'components/admin/ImageCropper/ImageInfoTooltip';

// Would have loved to put this in styling.ts, but
// that results in some arcane typescript error
// (see https://stackoverflow.com/q/43900035)
const StyledImagesDropzone = styled(ImagesDropzone)`
  margin-top: 2px;
`;

interface Props {
  image: UploadFile[] | null;
  onImageAdd: (newHeader: UploadFile[]) => void;
  onImageRemove: () => void;
}

export default ({ image, onImageAdd, onImageRemove }: Props) => {
  return (
    <StyledSectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.headerImageLabelText} />
        <ImageInfoTooltip />
      </SubSectionTitle>
      <StyledImagesDropzone
        images={image}
        imagePreviewRatio={1 / HEADER_BG_ASPECT_RATIO}
        acceptedFileTypes={{
          'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
        }}
        maxImagePreviewWidth="500px"
        onAdd={onImageAdd}
        onRemove={onImageRemove}
      />
    </StyledSectionField>
  );
};
