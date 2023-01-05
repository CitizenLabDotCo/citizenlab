import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Box } from '@citizenlab/cl2-component-library';
import { UploadFile } from 'typings';
import getCroppedImage from './getCroppedImage';

type ImageCropperProps = {
  image: UploadFile[] | null;
  onComplete: (image: string) => void;
  aspect: number;
};

const ImageCropper = ({ image, onComplete, aspect }: ImageCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });

  const onCropComplete = useCallback(
    async (_, croppedAreaPixels) => {
      if (image) {
        try {
          const croppedImage = await getCroppedImage(
            image[0].base64,
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
    <Box position="relative" height="300px" data-cy="e2e-image-cropper">
      {image && (
        <Cropper
          image={image[0].base64}
          crop={crop}
          zoom={1}
          aspect={aspect}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          objectFit="contain"
        />
      )}
    </Box>
  );
};

export { ImageCropper as default, ImageCropperProps };
