import React, { useEffect, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import ImageCropperContainer from 'components/admin/ImageCropper/Container';
import { UploadFile } from 'typings';
import HeaderBgDropzone from './HeaderBgDropzone';
import { HEADER_BG_ASPECT_RATIO, IProjectFormState } from 'services/projects';
import { convertUrlToUploadFile } from 'utils/fileUtils';

interface Props {
  imageUrl: string | null | undefined;
  onImageChange: (newImageBase64: string | null) => void;
}

export default ({ imageUrl, onImageChange }: Props) => {
  const [projectHeaderImage, setProjectHeaderImage] =
    useState<IProjectFormState['projectHeaderImage']>(null);

  useEffect(() => {
    (async () => {
      const projectHeaderImage = imageUrl
        ? await convertUrlToUploadFile(imageUrl, null, null)
        : null;
      setProjectHeaderImage(projectHeaderImage ? [projectHeaderImage] : null);
    })();
  }, [imageUrl]);

  const handleImageAdd = (newHeader: UploadFile[]) => {
    const newHeaderFile = newHeader[0];

    onImageChange(newHeaderFile.base64);
    setProjectHeaderImage([newHeaderFile]);
  };

  const handleImageRemove = async () => {
    onImageChange(null);
    setProjectHeaderImage(null);
  };

  const imageIsNotSaved = projectHeaderImage && !projectHeaderImage[0].remote;

  return imageIsNotSaved ? (
    <Box display="flex" flexDirection="column" gap="8px">
      <ImageCropperContainer
        image={projectHeaderImage}
        onComplete={onImageChange} // projectHeaderImage is not updated, but we don't need it
        aspect={HEADER_BG_ASPECT_RATIO}
      />
    </Box>
  ) : (
    <HeaderBgDropzone
      image={projectHeaderImage}
      onImageAdd={handleImageAdd}
      onImageRemove={handleImageRemove}
    />
  );
};
