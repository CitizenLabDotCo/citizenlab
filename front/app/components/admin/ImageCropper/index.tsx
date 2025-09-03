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
  show3x1MobileCropLines?: boolean;
};

const ImageCropper = ({
  image,
  onComplete,
  aspectRatioWidth,
  aspectRatioHeight,
  onRemove,
  show3x1MobileCropLines = false,
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

  const [mediaSize, setMediaSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const handleMediaLoaded = (mediaSize: { width: number; height: number }) => {
    setMediaSize(mediaSize);
  };

  return (
    <Box
      position="relative"
      height="300px"
      data-cy="e2e-image-cropper"
      data-testid="image-cropper"
    >
      {image && (
        <div style={{ position: 'relative', height: '100%' }}>
          <Cropper
            image={image.base64}
            crop={crop}
            zoom={1}
            aspect={aspectRatioWidth / aspectRatioHeight}
            onCropChange={handleCropChange}
            onCropComplete={onCropComplete}
            objectFit="contain"
            onMediaLoaded={handleMediaLoaded}
          />

          {/* 3:1 visual overlay inside crop area for mobile view */}
          {mediaSize && show3x1MobileCropLines && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: `${mediaSize.width * 0.75}px`,
                height: `110px`,
                maxHeight: `${mediaSize.height}px`,
                transform: 'translate(-50%, -50%)',
                borderLeft: '2px dashed rgba(255, 255, 255, 0.8)',
                borderRight: '2px dashed rgba(255, 255, 255, 0.8)',
                pointerEvents: 'none',
              }}
            />
          )}

          <RemoveImageButton onClick={onRemove} />
        </div>
      )}
    </Box>
  );
};

export { ImageCropper as default };
export type { ImageCropperProps };
