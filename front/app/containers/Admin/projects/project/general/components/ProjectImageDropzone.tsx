import React from 'react';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { UploadFile } from 'typings';
import { CARD_IMAGE_ASPECT_RATIO } from 'services/projects';
import { TPreviewDevice } from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/BannerImageFields/SelectPreviewDevice';

interface Props {
  projectImages: UploadFile[] | null;
  handleProjectImagesOnAdd: (projectImages: UploadFile[]) => void;
  handleProjectImageOnRemove: (projectImageToRemove: UploadFile) => void;
  previewDevice: TPreviewDevice;
}

const ProjectImageDropzone = ({
  projectImages,
  handleProjectImagesOnAdd,
  handleProjectImageOnRemove,
  previewDevice,
}: Props) => {
  const imagePreviewRatioPerDevice: { [key in TPreviewDevice]: number } = {
    phone: 1 / CARD_IMAGE_ASPECT_RATIO,
    tablet: 1,
    desktop: 1,
  };
  const imagePreviewRatio = imagePreviewRatioPerDevice[previewDevice];

  return (
    <ImagesDropzone
      images={projectImages}
      imagePreviewRatio={imagePreviewRatio}
      acceptedFileTypes={{
        'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      }}
      onAdd={handleProjectImagesOnAdd}
      onRemove={handleProjectImageOnRemove}
    />
  );
};

export default ProjectImageDropzone;
