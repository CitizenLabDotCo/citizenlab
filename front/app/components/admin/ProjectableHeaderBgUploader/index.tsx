import React, { useEffect, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { UploadFile } from 'typings';
import ImagesDropzone from 'components/UI/ImagesDropzone';

import { convertUrlToUploadFile } from 'utils/fileUtils';
import {
  PROJECTABLE_HEADER_BG_ASPECT_RATIO,
  PROJECTABLE_HEADER_BG_ASPECT_RATIO_HEIGHT,
  PROJECTABLE_HEADER_BG_ASPECT_RATIO_WIDTH,
} from 'api/projects/types';
import ImageCropperContainer from 'components/admin/ImageCropper/Container';

interface Props {
  imageUrl: string | null | undefined;
  onImageChange: (newImageBase64: string | null) => void;
}

const ProjectableHeaderBgUploader = ({ imageUrl, onImageChange }: Props) => {
  const [headerBg, setHeaderBg] = useState<UploadFile | null>(null);
  useEffect(() => {
    (async () => {
      if (imageUrl) {
        const headerFile = await convertUrlToUploadFile(imageUrl, null, null);
        setHeaderBg(headerFile || null);
      }
    })();
  }, [imageUrl]);

  const handleImageAdd = (newHeader: UploadFile[]) => {
    const newHeaderFile = newHeader[0];

    onImageChange(newHeaderFile.base64);
    setHeaderBg(newHeaderFile);
  };

  const handleImageRemove = async () => {
    onImageChange(null);
    setHeaderBg(null);
  };

  const imageShouldBeSaved = headerBg ? !headerBg.remote : false;

  return (
    <>
      {imageShouldBeSaved ? (
        <Box display="flex" flexDirection="column" gap="8px">
          <ImageCropperContainer
            image={headerBg}
            onComplete={onImageChange}
            aspectRatioWidth={PROJECTABLE_HEADER_BG_ASPECT_RATIO_WIDTH}
            aspectRatioHeight={PROJECTABLE_HEADER_BG_ASPECT_RATIO_HEIGHT}
            onRemove={handleImageRemove}
          />
        </Box>
      ) : (
        <ImagesDropzone
          images={headerBg ? [headerBg] : null}
          acceptedFileTypes={{
            'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
          }}
          imagePreviewRatio={1 / PROJECTABLE_HEADER_BG_ASPECT_RATIO}
          onAdd={handleImageAdd}
          onRemove={handleImageRemove}
        />
      )}
    </>
  );
};

export default ProjectableHeaderBgUploader;
