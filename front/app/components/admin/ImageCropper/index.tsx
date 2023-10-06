import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Box } from '@citizenlab/cl2-component-library';
import { UploadFile } from 'typings';
import getCroppedImage from './getCroppedImage';
import RemoveImageButton from 'components/UI/RemoveImageButton';

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

  const onCropComplete = useCallback(
    async (_, croppedAreaPixels) => {
      if (image) {
        try {
          const croppedImage = await getCroppedImage(
            image.base64,
            croppedAreaPixels
          );

          onComplete(croppedImage);
        } catch (e) {
          console.error(e);
        }
      }
    },
    [image, onComplete]
  );

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
            onCropChange={setCrop}
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
