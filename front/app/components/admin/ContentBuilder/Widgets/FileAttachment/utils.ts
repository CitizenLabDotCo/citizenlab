import { SerializedNodes } from '@craftjs/core';

/**
 * Extracts all fileIds currently used by FileAttachment widgets in the craftjs JSON
 */
export const getUsedFileIds = (craftjsJson: SerializedNodes): Set<string> => {
  const usedFileIds = new Set<string>();

  if (!craftjsJson || typeof craftjsJson !== 'object') {
    return usedFileIds;
  }

  // Traverse all nodes in the craftjs JSON
  Object.values(craftjsJson).forEach((node) => {
    if (typeof node === 'object' && node !== null) {
      const nodeType = node.type;

      // Check if this is a FileAttachment widget
      const isFileAttachmentWidget =
        (typeof nodeType === 'object' &&
          nodeType.resolvedName === 'FileAttachment') ||
        (typeof nodeType === 'string' && nodeType === 'FileAttachment');

      if (isFileAttachmentWidget && node.props?.fileId) {
        usedFileIds.add(node.props.fileId);
      }
    }
  });

  return usedFileIds;
};

/**
 * Counts how many times a specific fileId is used in the layout
 */
export const getFileUsageCount = (
  craftjsJson: SerializedNodes,
  fileId: string
): number => {
  if (!craftjsJson || typeof craftjsJson !== 'object' || !fileId) {
    return 0;
  }

  let count = 0;

  Object.values(craftjsJson).forEach((node) => {
    if (typeof node === 'object' && node !== null) {
      const nodeType = node.type;

      const isFileAttachmentWidget =
        (typeof nodeType === 'object' &&
          nodeType.resolvedName === 'FileAttachment') ||
        (typeof nodeType === 'string' && nodeType === 'FileAttachment');

      if (isFileAttachmentWidget && node.props?.fileId === fileId) {
        count++;
      }
    }
  });

  return count;
};
