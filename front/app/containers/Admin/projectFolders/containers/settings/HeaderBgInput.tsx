import React, { useEffect, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { UploadFile } from 'typings';
import HeaderBgDropzone from './HeaderBgDropzone';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { HEADER_BG_ASPECT_RATIO } from 'services/projects';
import ImageCropperContainer from 'components/admin/ImageCropper/Container';

interface Props {
  imageUrl: string | null | undefined;
  onImageChange: (newImageBase64: string | null) => void;
}

export default ({ imageUrl, onImageChange }: Props) => {
  const [headerBg, setHeaderBg] = useState<UploadFile[] | null>(null);
  useEffect(() => {
    (async () => {
      if (imageUrl) {
        const headerFile = await convertUrlToUploadFile(imageUrl, null, null);
        setHeaderBg(headerFile ? [headerFile] : null);
      }
    })();
  }, [imageUrl]);

  const handleImageAdd = (newHeader: UploadFile[]) => {
    const newHeaderFile = newHeader[0];

    onImageChange(newHeaderFile.base64);
    setHeaderBg([newHeaderFile]);
  };

  const handleImageRemove = async () => {
    onImageChange(null);
    setHeaderBg(null);
  };

  const imageIsNotSaved = headerBg && !headerBg[0].remote;

  return imageIsNotSaved ? (
    <Box display="flex" flexDirection="column" gap="8px">
      <ImageCropperContainer
        image={headerBg}
        onComplete={onImageChange}
        aspect={HEADER_BG_ASPECT_RATIO}
      />
    </Box>
  ) : (
    <HeaderBgDropzone
      image={headerBg}
      onImageAdd={handleImageAdd}
      onImageRemove={handleImageRemove}
    />
  );
};
