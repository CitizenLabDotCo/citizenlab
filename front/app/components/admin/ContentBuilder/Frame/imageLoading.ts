import { SerializedNode } from '@craftjs/core';

import eventEmitter from 'utils/eventEmitter';

import { IMAGE_LOADED_EVENT } from '../constants';

export const getImagesToBeLoaded = (
  editorData: Record<string, SerializedNode>
) => {
  return Object.values(editorData)
    .filter((node) => node.displayName === 'Image')
    .map((node) => node.props.imageUrl);
};

export const allImagesLoaded = (imagesToBeLoaded: string[]) => {
  return new Promise((resolve) => {
    if (imagesToBeLoaded.length === 0) {
      resolve(true);
      return;
    }

    const imageSet = new Set(imagesToBeLoaded);

    const subscription = eventEmitter
      .observeEvent(IMAGE_LOADED_EVENT)
      .subscribe(({ eventValue }) => {
        const imageUrl = eventValue as string;

        if (imageSet.has(imageUrl)) {
          imageSet.delete(imageUrl);

          if (imageSet.size === 0) {
            resolve(true);
            subscription.unsubscribe();
          }
        }
      });
  });
};
