import React, { useState, useCallback } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import Cropper, { Point } from 'react-easy-crop';
import { UploadFile } from 'typings';

import RemoveImageButton from 'components/UI/RemoveImageButton';

import getCroppedImage from './getCroppedImage';

type ImageCropperProps = {
  image: UploadFile | null;
  onComplete: (image: string) => void;
  aspectRatioWidth: number;
  aspectRatioHeight: number;
  onRemove: () => void;
};

const ImageCropper = ({
  image,
  onComplete,
  aspectRatioWidth,
  aspectRatioHeight,
  onRemove,
}: ImageCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [cropChanged, setCropChanged] = useState(false);

  const onCropComplete = useCallback(
    async (_, croppedAreaPixels) => {
      if (image && cropChanged) {
        try {
          const croppedImage = await getCroppedImage(
            image.base64,
            croppedAreaPixels
          );

          onComplete(croppedImage);
          setCropChanged(false);
        } catch (e) {
          console.error(e);
        }
      }
    },
    [image, onComplete, cropChanged]
  );

  const handleCropChange = useCallback((location: Point) => {
    setCropChanged(true);
    setCrop(location);
  }, []);

  return (
    <Box
      position="relative"
      height="300px"
      data-cy="e2e-image-cropper"
      data-testid="image-cropper"
    >
      {image && (
        <div>
          <Cropper
            image={image.base64}
            crop={crop}
            zoom={1}
            aspect={aspectRatioWidth / aspectRatioHeight}
            onCropChange={handleCropChange}
            onCropComplete={onCropComplete}
            objectFit="contain"
          />
          <RemoveImageButton onClick={onRemove} />
        </div>
      )}
    </Box>
  );
};

export { ImageCropper as default };
export type { ImageCropperProps };
