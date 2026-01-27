import { SerializedNodes } from '@craftjs/core';

import { getIsFileAlreadyUsed } from './utils';

describe('FileAttachment utils', () => {
  describe('getIsFileAlreadyUsed', () => {
    it('checks if a file is already used', () => {
      const craftjsJson = {
        ROOT: {
          type: { resolvedName: 'Container' },
          props: {},
          displayName: 'Container',
          isCanvas: true,
          parent: null,
          nodes: ['file1', 'file2', 'file3'],
          hidden: false,
          linkedNodes: {},
        },
        file1: {
          type: { resolvedName: 'FileAttachment' },
          props: { fileId: 'file-123' },
          displayName: 'FileAttachment',
          isCanvas: false,
          parent: 'ROOT',
          nodes: [],
          hidden: false,
          linkedNodes: {},
        },
        file2: {
          type: { resolvedName: 'FileAttachment' },
          props: { fileId: 'file-123' }, // Same file
          displayName: 'FileAttachment',
          isCanvas: false,
          parent: 'ROOT',
          nodes: [],
          hidden: false,
          linkedNodes: {},
        },
        file3: {
          type: { resolvedName: 'FileAttachment' },
          props: { fileId: 'file-456' }, // Different file
          displayName: 'FileAttachment',
          isCanvas: false,
          parent: 'ROOT',
          nodes: [],
          hidden: false,
          linkedNodes: {},
        },
      } as SerializedNodes;

      expect(getIsFileAlreadyUsed(craftjsJson, 'file-123')).toBe(true);
      expect(getIsFileAlreadyUsed(craftjsJson, 'file-456')).toBe(true);
      expect(getIsFileAlreadyUsed(craftjsJson, 'file-999')).toBe(false);
    });
  });
});
