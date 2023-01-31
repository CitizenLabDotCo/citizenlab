import React from 'react';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { UploadFile } from 'typings';
import { CARD_IMAGE_ASPECT_RATIO } from 'services/projectImages';
import { TDevice } from 'components/admin/SelectPreviewDevice';

interface Props {
  images: UploadFile[] | null;
  onAddImages: (projectImages: UploadFile[]) => void;
  onRemoveImage: (projectImageToRemove: UploadFile) => void;
  previewDevice: TDevice;
}

const ProjectCardImageDropzone = ({
  images,
  onAddImages,
  onRemoveImage,
  previewDevice,
}: Props) => {
  const imagePreviewRatioPerDevice: { [key in TDevice]: number } = {
    phone: 1 / CARD_IMAGE_ASPECT_RATIO,
    tablet: 1,
    desktop: 1,
  };
  const imagePreviewRatio = imagePreviewRatioPerDevice[previewDevice];

  return (
    <ImagesDropzone
      images={images}
      imagePreviewRatio={imagePreviewRatio}
      acceptedFileTypes={{
        'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      }}
      onAdd={onAddImages}
      onRemove={onRemoveImage}
    />
  );
};

export default ProjectCardImageDropzone;
