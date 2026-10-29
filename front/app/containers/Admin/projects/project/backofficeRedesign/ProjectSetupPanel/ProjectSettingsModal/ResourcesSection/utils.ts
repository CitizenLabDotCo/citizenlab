import { IconNames } from '@citizenlab/cl2-component-library';

export const getFileIcon = (mimeType: string): IconNames => {
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('image/')) return 'image';
  return 'page';
};

export const FILE_MODAL_HEIGHT = 'min(640px, 88vh)';
