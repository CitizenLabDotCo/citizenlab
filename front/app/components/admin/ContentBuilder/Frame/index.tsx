import React, { useEffect } from 'react';

import { Frame, Element, useEditor, SerializedNode } from '@craftjs/core';

import { getImagesToBeLoaded, allImagesLoaded } from './imageLoading';

type ContentBuilderFrame = {
  editorData?: Record<string, SerializedNode>;
  children?: React.ReactNode;
  onLoadImages?: () => void;
};

const ContentBuilderFrame = ({
  editorData,
  children,
  onLoadImages,
}: ContentBuilderFrame) => {
  const { actions } = useEditor();

  useEffect(() => {
    if (editorData) {
      actions.deserialize(editorData);

      if (onLoadImages) {
        const imagesToBeLoaded = getImagesToBeLoaded(editorData);

        allImagesLoaded(imagesToBeLoaded).then(() => {
          onLoadImages();
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorData]);

  return (
    <Frame>
      <Element id="e2e-content-builder-frame" is="div" canvas>
        {children}
      </Element>
    </Frame>
  );
};

export default ContentBuilderFrame;
