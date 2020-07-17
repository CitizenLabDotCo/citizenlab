import 'whatwg-fetch';
import { from } from 'rxjs';
import { UploadFile } from 'typings';
import { isString } from 'lodash-es';
import { reportError } from 'utils/loggingUtils';

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
  initiativeImg: {
    fb: [1200, 630],
    medium: [298, 135],
    small: [96, 96],
  },
};

export async function getBase64FromFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    if (file && !isString(file)) {
      const reader = new FileReader();
      reader.onloadend = (event: any) => resolve(event.target.result);
      reader.onerror = () => reject(new Error('error for getBase64()'));
      reader.readAsDataURL(file);
    } else {
      reject(new Error('input is not of type File'));
    }
  });
}

function convertBlobToFile(blob: Blob, fileName: string) {
  const b: any = blob;
  b.lastModifiedDate = new Date();
  b.name = fileName;
  return <File>b;
}

export async function convertUrlToUploadFile(
  url: string,
  id?: string | null,
  filename?: string | null
) {
  const headers = new Headers();
  headers.append('cache-control', 'no-cache');
  headers.append('pragma', 'no-cache');

  try {
    const blob = await fetch(url, { headers }).then((response) =>
      response.blob()
    );
    const urlFilename = url.substring(url.lastIndexOf('/') + 1);
    const uploadFile = convertBlobToFile(
      blob,
      filename || urlFilename
    ) as UploadFile;
    const base64 = await getBase64FromFile(uploadFile);
    uploadFile.url = url;
    uploadFile.base64 = base64;
    uploadFile.remote = true;
    uploadFile.filename = filename || urlFilename;
    uploadFile.id = id || undefined;
    return uploadFile;
  } catch (error) {
    reportError(error);
    return null;
  }
}

export function convertUrlToUploadFileObservable(
  url: string,
  id: string | null,
  filename: string | null
) {
  return from(convertUrlToUploadFile(url, id, filename));
}
