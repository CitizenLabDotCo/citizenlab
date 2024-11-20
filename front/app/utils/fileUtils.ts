import { isString } from 'lodash-es';
import { UploadFile } from 'typings';

import { reportError } from 'utils/loggingUtils';

import { isNilOrError } from './helperUtils';

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

export async function getBase64FromFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
  fileId?: string | null,
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
    const file = convertBlobToFile(blob, filename || urlFilename);
    const base64 = await getBase64FromFile(file);
    const uploadFile: UploadFile = Object.assign(file, {
      url,
      base64,
      remote: true,
      filename: filename || urlFilename,
      id: fileId || undefined,
    });

    return uploadFile;
  } catch (error) {
    reportError(error);
    return null;
  }
}

export function getFilesToRemove(
  localFiles: UploadFile[],
  remoteFiles: UploadFile[]
) {
  const localFileNames = localFiles.map((localFile) => localFile.filename);
  const filesToRemove = remoteFiles.filter(
    (remoteFile) => !localFileNames.includes(remoteFile.filename)
  );

  return filesToRemove;
}

export function getFilesToAdd(
  localFiles: UploadFile[],
  remoteFiles: UploadFile[] | null
) {
  if (!isNilOrError(remoteFiles)) {
    // if we have remote page files
    // filter out the local files that are already represent in the remote files
    return localFiles.filter((localFile) => {
      return !remoteFiles.some((remoteFile) =>
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        remoteFile ? remoteFile.filename === localFile.filename : true
      );
    });
  } else {
    // if we have no remote page files
    // return use array of local files
    return localFiles;
  }
}

export function returnFileSize(size: number) {
  if (size < 1024) {
    return `${size} bytes`;
  } else if (size >= 1024 && size < 1048576) {
    return `${(size / 1024).toFixed(1)} KB`;
  } else if (size >= 1048576) {
    return `${(size / 1048576).toFixed(1)} MB`;
  }
  return;
}

export function isUploadFile(file: UploadFile | null): file is UploadFile {
  return file !== null;
}
