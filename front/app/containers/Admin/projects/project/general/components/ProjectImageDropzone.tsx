import React from 'react';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { UploadFile } from 'typings';
import { CARD_IMAGE_ASPECT_RATIO } from 'services/projects';

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
  <ImagesDropzone
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
