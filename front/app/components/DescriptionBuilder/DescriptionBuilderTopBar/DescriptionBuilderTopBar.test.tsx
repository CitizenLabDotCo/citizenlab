import React from 'react';

import { Editor } from '@craftjs/core';

import clHistory from 'utils/cl-router/history';
import { render, screen, act, within, fireEvent } from 'utils/testUtils/rtl';

import DescriptionBuilderTopBar from '.';

let mockLocalesData = ['en'];
jest.mock('hooks/useAppConfigurationLocales', () =>
  jest.fn(() => mockLocalesData)
);

const mockParams = { projectId: 'id' };

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useParams: () => mockParams,
  useLocation: jest.fn(() => ({
    pathname: '/',
    search: '',
    hash: '',
    href: '/',
    state: {},
  })),
  useNavigate: jest.fn(() => jest.fn()),
  useRouterState: jest.fn(() => ({
    location: { pathname: '/', search: '', hash: '', href: '/', state: {} },
  })),
}));

jest.mock('api/projects/useProjectById', () => {
  return jest.fn(() => ({
    data: {
      data: {
        id: '2',
        type: 'project',
        attributes: {
          title_multiloc: { en: 'Test Project' },
          slug: 'test',
        },
      },
    },
  }));
});

jest.mock('@craftjs/core', () => {
  const originalModule = jest.requireActual('@craftjs/core');
  return {
    ...originalModule,
    useEditor: () => ({
      query: {
        getSerializedNodes: jest.fn(() => {
          return {};
        }),
      },
    }),
  };
});

const defaultProps = {
  selectedLocale: 'en',
  hasError: false,
  onSelectLocale: () => {},
  previewEnabled: false,
  setPreviewEnabled: () => {},
  contentBuildableType: 'project',
  backPath: '/projects',
  titleMultiloc: { en: 'Test Project' },
  previewLink: { to: '/projects/preview' },
  onSave: () => {},
  isSaving: false,
  saveHasError: false,
} as unknown as React.ComponentProps<typeof DescriptionBuilderTopBar>;

describe('DescriptionBuilderTopBar', () => {
  it('renders with correct project name', () => {
    render(
      <Editor>
        <DescriptionBuilderTopBar {...defaultProps} hasError />
      </Editor>
    );
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('calls goBack correctly', () => {
    render(
      <Editor>
        <DescriptionBuilderTopBar {...defaultProps} hasError />
      </Editor>
    );
    fireEvent.click(screen.getByTestId('goBackButton'));
    expect(clHistory.push).toHaveBeenCalled();
  });

  it('calls onSave with the serialized nodes', async () => {
    const onSave = jest.fn();
    render(
      <Editor>
        <DescriptionBuilderTopBar {...defaultProps} onSave={onSave} />
      </Editor>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('contentBuilderTopBarSaveButton'));
    });

    expect(onSave).toHaveBeenCalledWith({});
  });

  it('enables and disables save in accordance with the error status', async () => {
    const { rerender } = render(
      <Editor>
        <DescriptionBuilderTopBar {...defaultProps} hasError={true} />
      </Editor>
    );

    const saveButton = within(
      screen.getByTestId('contentBuilderTopBarSaveButton')
    ).getByRole('button');

    expect(saveButton).toHaveAttribute('aria-disabled', 'true');
    rerender(
      <Editor>
        <DescriptionBuilderTopBar {...defaultProps} hasError={false} />
      </Editor>
    );

    expect(saveButton).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('calls setPreviewEnabled correctly on toggle change when previewEnabled is false', async () => {
    const setPreviewEnabled = jest.fn();
    render(
      <Editor>
        <DescriptionBuilderTopBar
          {...defaultProps}
          setPreviewEnabled={setPreviewEnabled}
        />
      </Editor>
    );
    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);

    const previewEnabled = setPreviewEnabled.mock.calls[0][0](false);
    expect(previewEnabled).toBe(true);
  });

  it('calls setPreviewEnabled correctly on toggle change when previewEnabled is true', async () => {
    const setPreviewEnabled = jest.fn();
    render(
      <Editor>
        <DescriptionBuilderTopBar
          {...defaultProps}
          previewEnabled={true}
          setPreviewEnabled={setPreviewEnabled}
        />
      </Editor>
    );
    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);

    const previewEnabled = setPreviewEnabled.mock.calls[0][0](true);
    expect(previewEnabled).toBe(false);
  });

  it('does not render locale switcher when there is only one locale', () => {
    render(
      <Editor>
        <DescriptionBuilderTopBar {...defaultProps} />
      </Editor>
    );
    expect(screen.queryByText('en')).not.toBeInTheDocument();
  });

  it('renders locale switcher when there is more than one locale', () => {
    mockLocalesData = ['en', 'fr-FR'];
    const { container } = render(
      <Editor>
        <DescriptionBuilderTopBar {...defaultProps} />
      </Editor>
    );
    expect(container.querySelector('#e2e-locale-select')).toBeInTheDocument();
  });

  it('calls onSelectLocale correctly when the locale is changed', () => {
    mockLocalesData = ['en', 'fr-FR'];
    const onSelectLocale = jest.fn();
    const { container } = render(
      <Editor>
        <DescriptionBuilderTopBar
          {...defaultProps}
          onSelectLocale={onSelectLocale}
        />
      </Editor>
    );

    expect(container.querySelector('#e2e-locale-select')).toBeInTheDocument();

    fireEvent.change(container.querySelector('#e2e-locale-select'), {
      target: { value: 'fr-FR' },
    });
    expect(onSelectLocale).toHaveBeenCalledWith({
      editorData: {},
      locale: 'fr-FR',
    });
  });

  it('sets Save button to pending state correctly', () => {
    render(
      <Editor>
        <DescriptionBuilderTopBar {...defaultProps} hasPendingState={true} />
      </Editor>
    );
    expect(screen.getByTestId('contentBuilderTopBarSaveButton')).toHaveClass(
      'disabled'
    );
  });
});
