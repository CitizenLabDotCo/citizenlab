import { getUsedFileIds, getFileUsageCount } from '../utils';

describe('FileAttachment utils', () => {
  describe('getUsedFileIds', () => {
    it('extracts fileIds from FileAttachment widgets', () => {
      const craftjsJson = {
        ROOT: {
          type: { resolvedName: 'Container' },
          nodes: ['file1', 'file2'],
        },
        file1: {
          type: { resolvedName: 'FileAttachment' },
          props: { fileId: 'file-123' },
        },
        file2: {
          type: { resolvedName: 'FileAttachment' },
          props: { fileId: 'file-456' },
        },
        other: {
          type: { resolvedName: 'Text' },
          props: { text: 'Some text' },
        },
      };

      const result = getUsedFileIds(craftjsJson);
      expect(result).toEqual(new Set(['file-123', 'file-456']));
    });

    it('handles widgets without fileId', () => {
      const craftjsJson = {
        ROOT: {
          type: { resolvedName: 'Container' },
          nodes: ['file1'],
        },
        file1: {
          type: { resolvedName: 'FileAttachment' },
          props: {}, // No fileId
        },
      };

      const result = getUsedFileIds(craftjsJson);
      expect(result).toEqual(new Set([]));
    });

    it('handles empty craftjs JSON', () => {
      const result = getUsedFileIds({});
      expect(result).toEqual(new Set([]));
    });
  });

  describe('getFileUsageCount', () => {
    it('counts how many times a file is used', () => {
      const craftjsJson = {
        ROOT: {
          type: { resolvedName: 'Container' },
          nodes: ['file1', 'file2', 'file3'],
        },
        file1: {
          type: { resolvedName: 'FileAttachment' },
          props: { fileId: 'file-123' },
        },
        file2: {
          type: { resolvedName: 'FileAttachment' },
          props: { fileId: 'file-123' }, // Same file
        },
        file3: {
          type: { resolvedName: 'FileAttachment' },
          props: { fileId: 'file-456' }, // Different file
        },
      };

      expect(getFileUsageCount(craftjsJson, 'file-123')).toBe(2);
      expect(getFileUsageCount(craftjsJson, 'file-456')).toBe(1);
      expect(getFileUsageCount(craftjsJson, 'file-999')).toBe(0);
    });
  });
});
