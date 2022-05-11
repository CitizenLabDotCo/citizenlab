import React from 'react';
import { render, screen, fireEvent, act, within } from 'utils/testUtils/rtl';
import ContentBuilderTopBar from './';
import { Editor } from '@craftjs/core';
import {
  IContentBuilderLayoutData,
  addContentBuilderLayout,
} from '../../../services/contentBuilder';
import clHistory from 'utils/cl-router/history';
import eventEmitter from 'utils/eventEmitter';

const mockEditorData: IContentBuilderLayoutData = {
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

jest.mock('utils/cl-intl');
jest.mock('utils/cl-router/history');
jest.mock('hooks/useLocale');
jest.mock('hooks/useLocalize');
jest.mock('../../../hooks/useContentBuilder', () => {
  return jest.fn(() => ({ data: mockEditorData }));
});

jest.mock('../../../services/contentBuilder', () => ({
  PROJECT_DESCRIPTION_CODE: 'project_description',
  addContentBuilderLayout: jest.fn(),
}));

const mockParams = { projectId: 'id' };

jest.mock('react-router', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return <Component {...props} params={mockParams} />;
      };
    },
    Link: () => 'LinkText',
  };
});

jest.mock('hooks/useProject', () => {
  return jest.fn(() => ({
    id: '2',
    type: 'project',
    attributes: {
      title_multiloc: { en: 'Test Project' },
      slug: 'test',
    },
  }));
});

jest.mock('@craftjs/core', () => {
  const originalModule = jest.requireActual('@craftjs/core');
  return {
    ...originalModule,
    useEditor: () => ({ query: { serialize: jest.fn(() => '{}') } }),
  };
});

describe('ContentBuilderTopBar', () => {
  it('renders with correct project name', () => {
    render(
      <Editor>
        <ContentBuilderTopBar />
      </Editor>
    );
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });
  it('calls goBack correctly', () => {
    render(
      <Editor>
        <ContentBuilderTopBar />
      </Editor>
    );
    fireEvent.click(screen.getByTestId('goBackButton'));
    expect(clHistory.push).toHaveBeenCalled();
  });
  it('calls onSave correctly', async () => {
    render(
      <Editor>
        <ContentBuilderTopBar />
      </Editor>
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId('contentBuilderTopBarSaveButton'));
    });

    expect(addContentBuilderLayout).toHaveBeenCalledWith(
      { code: 'project_description', projectId: 'id' },
      { craftjs_jsonmultiloc: { en: {} } }
    );
  });
  it('enables and disables save in accordance with the error status', async () => {
    render(
      <Editor>
        <ContentBuilderTopBar />
      </Editor>
    );
    await act(async () => {
      eventEmitter.emit('contentBuilderError', { someId: true });
      eventEmitter.emit('contentBuilderError', { someOtherId: true });
    });

    const saveButton = within(
      screen.getByTestId('contentBuilderTopBarSaveButton')
    ).getByRole('button');

    expect(saveButton).toBeDisabled();

    await act(async () => {
      eventEmitter.emit('contentBuilderError', { someId: false });
    });
    expect(saveButton).toBeDisabled();

    await act(async () => {
      eventEmitter.emit('contentBuilderError', { someOtherId: false });
    });
    expect(saveButton).not.toBeDisabled();
  });
  it('re-enables save when the element with the error is deleted', async () => {
    render(
      <Editor>
        <ContentBuilderTopBar />
      </Editor>
    );
    await act(async () => {
      eventEmitter.emit('contentBuilderError', { someId: true });
    });

    const saveButton = within(
      screen.getByTestId('contentBuilderTopBarSaveButton')
    ).getByRole('button');

    expect(saveButton).toBeDisabled();

    await act(async () => {
      eventEmitter.emit('deleteContentBuilderElement', 'someId');
    });

    expect(saveButton).not.toBeDisabled();
  });
});
