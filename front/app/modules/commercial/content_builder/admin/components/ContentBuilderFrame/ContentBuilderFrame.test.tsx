import React from 'react';
import { render } from 'utils/testUtils/rtl';
import ContentBuilderFrame from './';
import { Editor, SerializedNodes } from '@craftjs/core';

const mockEditorData: SerializedNodes = {
  nodeId: {
    custom: {},
    displayName: 'div',
    hidden: false,
    isCanvas: true,
    linkedNodes: {},
    nodes: [],
    type: 'div',
    props: {},
    parent: 'ROOT',
  },
};

const mockDeserialize = jest.fn();

jest.mock('@craftjs/core', () => {
  const originalModule = jest.requireActual('@craftjs/core');
  return {
    ...originalModule,
    useEditor: () => ({ actions: { deserialize: mockDeserialize } }),
  };
});

describe('ContentBuilderFrame', () => {
  it('calls deserialize correctly when there is data', () => {
    render(
      <Editor>
        <ContentBuilderFrame editorData={mockEditorData} />
      </Editor>
    );
    expect(mockDeserialize).toHaveBeenCalledWith(mockEditorData);
  });
  it('does not call deserialize when there is no data', () => {
    render(
      <Editor>
        <ContentBuilderFrame editorData={undefined} />
      </Editor>
    );
    expect(mockDeserialize).not.toHaveBeenCalled();
  });
});
