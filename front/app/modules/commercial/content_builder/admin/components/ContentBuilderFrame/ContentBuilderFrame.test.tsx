import React from 'react';
import { render } from 'utils/testUtils/rtl';
import ContentBuilderFrame from './';
import { Editor } from '@craftjs/core';
import { IContentBuilderLayoutData } from '../../../services/contentBuilder';

let mockEditorData: IContentBuilderLayoutData = {
  id: '2',
  type: 'content_builder_layout',
  attributes: {
    craftjs_jsonmultiloc: {
      en: {
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
      },
    },
    code: 'project_description',
    enabled: true,
  },
};

jest.mock('hooks/useLocale');
jest.mock('../../../hooks/useContentBuilder', () => {
  return jest.fn(() => ({ data: mockEditorData }));
});

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
        <ContentBuilderFrame projectId="id" />
      </Editor>
    );
    expect(mockDeserialize).toHaveBeenCalledWith(
      mockEditorData.attributes.craftjs_jsonmultiloc.en
    );
  });
  it('does not call deserialize when there is no data', () => {
    mockEditorData = {
      id: '2',
      type: 'content_builder_layout',
      attributes: {
        craftjs_jsonmultiloc: {},
        code: 'project_description',
        enabled: true,
      },
    };
    render(
      <Editor>
        <ContentBuilderFrame projectId="id" />
      </Editor>
    );
    expect(mockDeserialize).not.toHaveBeenCalled();
  });
});
