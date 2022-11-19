import React from 'react';
import { screen, render, act } from 'utils/testUtils/rtl';

import {
  ContentBuilderPage,
  CONTENT_BUILDER_DELETE_ELEMENT_EVENT,
  CONTENT_BUILDER_ERROR_EVENT,
} from './';

import { IContentBuilderLayoutData } from '../../services/contentBuilder';
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
jest.mock('services/locale');
jest.mock('hooks/useLocalize');
jest.mock('../../hooks/useContentBuilder', () => {
  return jest.fn(() => ({ data: mockEditorData }));
});

jest.mock('hooks/useAppConfigurationLocales', () =>
  jest.fn(() => ['en', 'fr-FR'])
);

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useLocation: () => ({
      pathname: 'admin/content-builder',
    }),
    useParams: () => ({
      projectId: 'projectId',
    }),
  };
});

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));

jest.mock('@craftjs/core', () => {
  const originalModule = jest.requireActual('@craftjs/core');
  return {
    ...originalModule,
    useEditor: () => ({
      connectors: { create: jest.fn() },
      query: { serialize: jest.fn(() => '{}') },
      actions: { selectNode: jest.fn(), deserialize: jest.fn(() => {}) },
    }),
  };
});

describe('ContentBuilderPage', () => {
  it('should render', () => {
    render(<ContentBuilderPage />);
    expect(screen.getByTestId('contentBuilderPage')).toBeInTheDocument();
  });
  it('should not display error message when there is no error', () => {
    render(<ContentBuilderPage />);
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });
  it('should display error message when there is an error', async () => {
    render(<ContentBuilderPage />);
    await act(async () => {
      eventEmitter.emit(CONTENT_BUILDER_ERROR_EVENT, {
        someId: { hasError: true, selectedLocale: 'en' },
      });
      eventEmitter.emit(CONTENT_BUILDER_ERROR_EVENT, {
        someOtherId: { hasError: true, selectedLocale: 'fr-FR' },
      });
    });

    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('en').firstChild).toHaveClass('empty');
    expect(screen.getByText('fr-FR').firstChild).toHaveClass('empty');
  });
  it('should display error message when there is an error and clear it when the error is gone', async () => {
    render(<ContentBuilderPage />);
    await act(async () => {
      eventEmitter.emit(CONTENT_BUILDER_ERROR_EVENT, {
        someId: { hasError: true, selectedLocale: 'en' },
      });
      eventEmitter.emit(CONTENT_BUILDER_ERROR_EVENT, {
        someOtherId: { hasError: true, selectedLocale: 'fr-FR' },
      });
    });

    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('en').firstChild).toHaveClass('empty');
    expect(screen.getByText('fr-FR').firstChild).toHaveClass('empty');

    await act(async () => {
      eventEmitter.emit(CONTENT_BUILDER_ERROR_EVENT, {
        someId: { hasError: false, selectedLocale: 'en' },
      });
    });

    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('en').firstChild).not.toHaveClass('empty');
    expect(screen.getByText('fr-FR').firstChild).toHaveClass('empty');

    await act(async () => {
      eventEmitter.emit(CONTENT_BUILDER_ERROR_EVENT, {
        someOtherId: { hasError: false, selectedLocale: 'fr-FR' },
      });
    });

    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    expect(screen.getByText('en').firstChild).not.toHaveClass('empty');
    expect(screen.getByText('fr-FR').firstChild).not.toHaveClass('empty');
  });

  it('should clear error message when element is deleted', async () => {
    render(<ContentBuilderPage />);
    await act(async () => {
      eventEmitter.emit(CONTENT_BUILDER_ERROR_EVENT, {
        someId: { hasError: true, selectedLocale: 'en' },
      });
    });

    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByText('en').firstChild).toHaveClass('empty');

    await act(async () => {
      eventEmitter.emit(CONTENT_BUILDER_DELETE_ELEMENT_EVENT, 'someId');
    });

    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    expect(screen.getByText('en').firstChild).not.toHaveClass('empty');
  });
});
