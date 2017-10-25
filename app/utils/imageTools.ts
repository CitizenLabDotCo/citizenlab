import * as _ from 'lodash';
import { ImageFile } from 'react-dropzone';

export async function getBase64(image: ImageFile) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event: any) => resolve(event.target.result);
    reader.onerror = (error) => reject(new Error(`error for getBase64()`));
    reader.readAsDataURL(image);
  });
}

export function generateImagePreview(image: ImageFile) {
  if (image.type && _.some(['image/jpeg', 'image/jpg', 'image/png', 'image/gif'], image.type)) {
    const blob = new Blob([image], { type: image.type });
    return window.URL.createObjectURL(blob);
  }

  return undefined;
}
