import React from 'react';

import { UploadFile } from 'typings';

import { CARD_IMAGE_ASPECT_RATIO } from 'api/project_images/useProjectImages';

import ImagesDropzone from 'components/UI/ImagesDropzone';

interface Props {
  images: UploadFile[] | null;
  onAddImages: (projectImages: UploadFile[]) => void;
  onRemoveImage: (projectImageToRemove: UploadFile) => void;
}

const ProjectCardImageDropzone = ({
  images,
  onAddImages,
  onRemoveImage,
}: Props) => {
  return (
    <ImagesDropzone
      images={images}
      imagePreviewRatio={1 / CARD_IMAGE_ASPECT_RATIO}
      acceptedFileTypes={{
        'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      }}
      onAdd={onAddImages}
      onRemove={onRemoveImage}
    />
  );
};

export default ProjectCardImageDropzone;
