import React, { useEffect, memo } from 'react';
import { Frame, Element, useEditor, SerializedNode } from '@craftjs/core';

type ContentBuilderFrame = {
  editorData?: Record<string, SerializedNode>;
  children?: React.ReactNode;
};

const ContentBuilderFrame = memo(
  ({ editorData, children }: ContentBuilderFrame) => {
    const { actions } = useEditor();

    useEffect(() => {
      if (editorData) {
        actions.deserialize(editorData);
      }
    }, [editorData, actions]);

    return (
      <Frame>
        <Element id="e2e-content-builder-frame" is="div" canvas>
          {children}
        </Element>
      </Frame>
    );
  }
);

export default ContentBuilderFrame;
