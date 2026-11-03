import { SerializedNode, SerializedNodes } from '@craftjs/core';

import eventEmitter from 'utils/eventEmitter';

import { IMAGE_LOADED_EVENT } from '../constants';

import { allImagesLoaded, getImagesToBeLoaded } from './imageLoading';

const node = (
  type: SerializedNode['type'],
  displayName: string,
  props: SerializedNode['props']
): SerializedNode => ({
  type,
  displayName,
  props,
  isCanvas: false,
  parent: 'ROOT',
  nodes: [],
  hidden: false,
  linkedNodes: {},
});

describe('getImagesToBeLoaded', () => {
  it('returns the image url of every image widget, whatever its displayName', () => {
    const editorData: SerializedNodes = {
      ROOT: node('div', 'div', {}),
      unminified: node({ resolvedName: 'ImageMultiloc' }, 'Image', {
        image: { imageUrl: 'https://example.org/one.png' },
      }),
      minified: node({ resolvedName: 'ImageMultiloc' }, 'n', {
        image: { imageUrl: 'https://example.org/two.png' },
      }),
      text: node({ resolvedName: 'TextMultiloc' }, 'Image', { text: {} }),
    };

    expect(getImagesToBeLoaded(editorData)).toEqual([
      'https://example.org/one.png',
      'https://example.org/two.png',
    ]);
  });

  it('skips image widgets that have no image yet', () => {
    const editorData: SerializedNodes = {
      ROOT: node('div', 'div', {}),
      empty: node({ resolvedName: 'ImageMultiloc' }, 'Image', {}),
    };

    expect(getImagesToBeLoaded(editorData)).toEqual([]);
  });
});

describe('allImagesLoaded', () => {
  it('resolves immediately when there is nothing to load', async () => {
    await expect(allImagesLoaded([])).resolves.toBe(true);
  });

  it('resolves once every listed image has emitted its loaded event', async () => {
    let resolved = false;
    const promise = allImagesLoaded([
      'https://example.org/one.png',
      'https://example.org/two.png',
    ]).then(() => {
      resolved = true;
    });

    eventEmitter.emit(IMAGE_LOADED_EVENT, 'https://example.org/one.png');
    await Promise.resolve();
    expect(resolved).toBe(false);

    eventEmitter.emit(IMAGE_LOADED_EVENT, 'https://example.org/two.png');
    await promise;
    expect(resolved).toBe(true);
  });
});
