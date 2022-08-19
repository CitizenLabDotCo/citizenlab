import React, { useEffect, memo } from 'react';
import { Frame, Element, useEditor, SerializedNode } from '@craftjs/core';

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
