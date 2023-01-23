import React from 'react';
import styled from 'styled-components';

// components
import ImagesDropzone from 'components/UI/ImagesDropzone';

// typings
import { UploadFile } from 'typings';

import { CARD_IMAGE_ASPECT_RATIO } from 'services/projects';

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
  <StyledImagesDropzone
    images={projectImages}
    imagePreviewRatio={1 / CARD_IMAGE_ASPECT_RATIO}
    maxImagePreviewWidth="240px"
    acceptedFileTypes={{
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
    }}
    onAdd={handleProjectImagesOnAdd}
    onRemove={handleProjectImageOnRemove}
  />
);
