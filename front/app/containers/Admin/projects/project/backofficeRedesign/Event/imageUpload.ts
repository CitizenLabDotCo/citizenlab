import { UploadFile } from 'typings';

import { getBase64FromFile } from 'utils/fileUtils';

export const MAX_IMAGE_FILE_SIZE_MB = 10;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

export const isImageTooLarge = (file: File) =>
  file.size > MAX_IMAGE_FILE_SIZE_MB * 1000000;

export const toUploadFile = async (file: File): Promise<UploadFile> => {
  const base64 = await getBase64FromFile(file);
  return Object.assign(file, {
    base64,
    url: base64,
    remote: false,
    filename: file.name,
  });
};
