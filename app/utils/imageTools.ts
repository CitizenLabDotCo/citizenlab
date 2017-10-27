import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import 'whatwg-fetch';
import { ImageFile } from 'react-dropzone';

export async function getBase64(file: File | ImageFile) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event: any) => resolve(event.target.result);
    reader.onerror = (error) => reject(new Error(`error for getBase64()`));
    reader.readAsDataURL(file);
  });
}

export async function getBase64FromObjectUrl(objectUrl: string) {
  return new Promise<string>((resolve, reject) => {
    const blob = new Blob([objectUrl], { type: 'file' });
    const reader = new FileReader();
    reader.onload = (event: any) => resolve(event.target.result);
    reader.onerror = (error) => reject(new Error(`error for getBase64FromObjectUrl()`));
    reader.readAsDataURL(blob); 
  });
}

export function generateImagePreview(image: File | ImageFile) {
  const blob = new Blob([image], { type: image.type });
  const objectUrl = window.URL.createObjectURL(blob);
  return objectUrl;
}

export function convertUrlToBlob(url: string) {
  return new Blob([url], { type: 'file' });
}

export function convertBlobToFile(blob: Blob, filename: string) {
  return new File([blob], filename, { lastModified: Date.now() });
}

export async function imageUrlToFile(imageUrl: string) {
  const blob = await fetch(imageUrl).then((response) => response.blob());
  const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
  return convertBlobToFile(blob, filename);
}

export function imageUrlToFileObservable(imageUrl: string | null | undefined) {
  if (imageUrl !== null && imageUrl !== undefined && _.isString(imageUrl)) {
    return Rx.Observable.fromPromise(imageUrlToFile(imageUrl));
  }

  return Rx.Observable.of(null);
}
