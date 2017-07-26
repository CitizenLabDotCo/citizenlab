import { ImageFile } from 'react-dropzone';

export async function getBase64(image: ImageFile) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event: any) => resolve(event.target.result);
    reader.readAsDataURL(image);
  });
}
