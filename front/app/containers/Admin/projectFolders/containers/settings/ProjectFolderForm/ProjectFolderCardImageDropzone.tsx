import React from 'react';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { UploadFile } from 'typings';
import { CARD_IMAGE_ASPECT_RATIO } from 'api/project_folder_images/types';

interface Props {
  images: UploadFile[] | null;
  onAddImage: (projectImages: UploadFile[]) => void;
  onRemoveImage: (projectImageToRemove: UploadFile) => void;
}

const ProjectFolderImageDropzone = ({
  images,
  onAddImage,
  onRemoveImage,
}: Props) => {
  return (
    <ImagesDropzone
      images={images}
      imagePreviewRatio={1 / CARD_IMAGE_ASPECT_RATIO}
      acceptedFileTypes={{
        'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      }}
      onAdd={onAddImage}
      onRemove={onRemoveImage}
    />
  );
};

export default ProjectFolderImageDropzone;
