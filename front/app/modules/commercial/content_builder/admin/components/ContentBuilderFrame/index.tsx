import { Element, Frame, SerializedNode, useEditor } from '@craftjs/core';
import React, { memo, useEffect } from 'react';

type ContentBuilderFrame = {
  editorData?: Record<string, SerializedNode>;
};

const ContentBuilderFrame = memo(({ editorData }: ContentBuilderFrame) => {
  const { actions } = useEditor();

  useEffect(() => {
    if (editorData) {
      actions.deserialize(editorData);
    }
  }, [editorData, actions]);

  return (
    <Frame>
      <Element id="e2e-content-builder-frame" is="div" canvas />
    </Frame>
  );
});

export default ContentBuilderFrame;
