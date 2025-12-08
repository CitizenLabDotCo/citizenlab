import { SerializedNodes } from '@craftjs/core';

/**
 * Check if a specific fileId is used in the layout
 */
export const getIsFileAlreadyUsed = (
  craftjsJson: SerializedNodes,
  fileId: string
): boolean => {
  if (typeof craftjsJson !== 'object' || !fileId) {
    return false;
  }

  let fileUsed = false;

  Object.values(craftjsJson).forEach((node) => {
    if (typeof node === 'object') {
      const isFileAttachmentWidget = node.displayName === 'FileAttachment';
      if (isFileAttachmentWidget && node.props?.fileId === fileId) {
        fileUsed = true;
      }
    }
  });

  return fileUsed;
};
