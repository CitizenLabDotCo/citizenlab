import { SerializedNodes } from '@craftjs/core';

/**
 * Counts how many times a specific fileId is used in the layout
 */
export const getFileUsageCount = (
  craftjsJson: SerializedNodes,
  fileId: string
): number => {
  if (typeof craftjsJson !== 'object' || !fileId) {
    return 0;
  }

  let count = 0;

  Object.values(craftjsJson).forEach((node) => {
    if (typeof node === 'object') {
      const isFileAttachmentWidget = node.displayName === 'FileAttachment';
      if (isFileAttachmentWidget && node.props?.fileId === fileId) {
        count++;
      }
    }
  });

  return count;
};
