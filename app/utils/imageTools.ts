import 'whatwg-fetch';
import { from } from 'rxjs';
import { ImageFile } from 'typings';

export const imageSizes = {
  headerBg: {
    large: [1440, 480],
    medium: [720, 152],
    small: [520, 250],
  },
  projectBg: {
    large: [1440, 360],
    medium: [720, 180],
    small: [520, 250],
  },
  ideaImg: {
    fb: [1200, 630],
    medium: [298, 135],
    small: [96, 96],
  },
};

export async function getBase64FromFile(file: File | ImageFile) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event: any) => resolve(event.target.result);
    reader.onerror = () => reject(new Error('error for getBase64()'));
    reader.readAsDataURL(file);
  });
}

export async function getBase64FromObjectUrl(objectUrl: string) {
  return new Promise<string>((resolve, reject) => {
    const blob = new Blob([objectUrl], { type: 'file' });
    const reader = new FileReader();
    reader.onload = (event: any) => resolve(event.target.result);
    reader.onerror = () => reject(new Error('error for getBase64FromObjectUrl()'));
    reader.readAsDataURL(blob);
  });
}

export function createObjectUrl(image: File | ImageFile) {
  const blob = new Blob([image], { type: image.type });
  const objectUrl = window.URL.createObjectURL(blob);
  return objectUrl;
}

export function revokeObjectURL(objectUrl: string) {
  window.URL.revokeObjectURL(objectUrl);
}

export function convertUrlToBlob(url: string) {
  return new Blob([url], { type: 'file' });
}

export function convertBlobToFile(blob: Blob, fileName: string) {
  const b: any = blob;
  b.lastModifiedDate = new Date();
  b.name = fileName;
  return <File>b;
}

export async function convertUrlToFile(imageUrl: string | null): Promise<File | null> {
  // We don't cache this, to deal with CORS issues.
  // https://bugs.chromium.org/p/chromium/issues/detail?id=260239
  // https://stackoverflow.com/questions/26352083/chrome-cors-cache-requesting-same-file-from-two-different-origins

  if (!imageUrl) {
    return null;
  }

  const headers = new Headers();
  headers.append('cache-control', 'no-cache');
  headers.append('pragma', 'no-cache');
  const blob = await fetch(imageUrl, { headers }).then((response) => response.blob());
  const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
  return convertBlobToFile(blob, filename);
}

export function convertUrlToFileObservable(imageUrl: string | null) {
  return from(convertUrlToFile(imageUrl));
}
