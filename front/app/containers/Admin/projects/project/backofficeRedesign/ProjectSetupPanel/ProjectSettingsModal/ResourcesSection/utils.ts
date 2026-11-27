import { IconName } from 'design-system/Icon';

// The design system has no audio icon, so audio falls back to the file icon.
export const getFileIcon = (mimeType: string): IconName => {
  if (mimeType.startsWith('video/')) return 'square-play-14';
  if (mimeType.startsWith('image/')) return 'image-14';
  return 'file-16';
};
