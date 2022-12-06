import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Box } from '@citizenlab/cl2-component-library';
import { UploadFile } from 'typings';

type ImageCropperProps = {
  image: UploadFile[] | null;
  onComplete: (image: string) => void;
};

const ImageCropper = ({ image, onComplete }: ImageCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });

  const onCropComplete = useCallback(
    async (_, croppedAreaPixels) => {
      if (image) {
        try {
          const croppedImage = await getCroppedImg(
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
    <Box position="relative" height="300px">
      {image && (
        <Cropper
          image={image[0].base64}
          crop={crop}
          zoom={1}
          aspect={16 / 9}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          showGrid={false}
          objectFit="contain"
        />
      )}
    </Box>
  );
};

export default ImageCropper;

const createImage = (url: string): Promise<any> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { height: number; width: number; x: number; y: number }
): Promise<any> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // set canvas size to match the bounding box
  canvas.width = image.width;
  canvas.height = image.height;

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(image.width / 2, image.height / 2);

  ctx.scale(1, 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // draw rotated image
  ctx.drawImage(image, 0, 0);

  // croppedAreaPixels values are bounding box relative
  // extract the cropped image using these values
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // paste generated rotate image at the top left corner
  ctx.putImageData(data, 0, 0);

  // As Base64 string
  return canvas.toDataURL('image/jpeg');
}
