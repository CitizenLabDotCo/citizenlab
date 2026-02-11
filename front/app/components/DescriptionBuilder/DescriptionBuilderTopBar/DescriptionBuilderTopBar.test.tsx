import React from 'react';

import { Editor } from '@craftjs/core';

import { IContentBuilderData } from 'api/content_builder/types';

import clHistory from 'utils/cl-router/history';
import { render, screen, act, within, fireEvent } from 'utils/testUtils/rtl';

import ProjectDescriptionBuilderTopBar from '.';

const mockEditorData: IContentBuilderData = {
  id: '2',
  type: 'content_builder_layout',
  attributes: {
    craftjs_json: {
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
    code: 'project_description',
    enabled: true,
  },
};

jest.mock('api/content_builder/useContentBuilderLayout', () => () => {
  return {
    data: mockEditorData,
  };
});

const mockAddProjectDescriptionBuilderLayout = jest.fn();
jest.mock('api/content_builder/useAddContentBuilderLayout', () =>
  jest.fn(() => ({ mutate: mockAddProjectDescriptionBuilderLayout }))
);

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

describe('ProjectDescriptionBuilderTopBar', () => {
  it('renders with correct project name', () => {
    render(
      <Editor>
        <ProjectDescriptionBuilderTopBar
          selectedLocale="en"
          hasError
          onSelectLocale={() => {}}
          previewEnabled={false}
          setPreviewEnabled={() => {}}
          contentBuildableId="2"
          contentBuildableType="project"
          backPath="/projects"
          titleMultiloc={{ en: 'Test Project' }}
          previewPath="/projects/preview"
        />
      </Editor>
    );
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });
  it('calls goBack correctly', () => {
    render(
      <Editor>
        <ProjectDescriptionBuilderTopBar
          selectedLocale="en"
          hasError
          onSelectLocale={() => {}}
          previewEnabled={false}
          setPreviewEnabled={() => {}}
          contentBuildableId="2"
          contentBuildableType="project"
          backPath="/projects"
          titleMultiloc={{ en: 'Test Project' }}
          previewPath="/projects/preview"
        />
      </Editor>
    );
    fireEvent.click(screen.getByTestId('goBackButton'));
    expect(clHistory.push).toHaveBeenCalled();
  });
  it('calls onSave correctly', async () => {
    render(
      <Editor>
        <ProjectDescriptionBuilderTopBar
          selectedLocale="en"
          hasError={false}
          onSelectLocale={() => {}}
          previewEnabled={false}
          setPreviewEnabled={() => {}}
          contentBuildableId="2"
          contentBuildableType="project"
          backPath="/projects"
          titleMultiloc={{ en: 'Test Project' }}
          previewPath="/projects/preview"
        />
      </Editor>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('contentBuilderTopBarSaveButton'));
    });

    expect(mockAddProjectDescriptionBuilderLayout).toHaveBeenCalledWith({
      contentBuildableId: '2',
      contentBuildableType: 'project',
      craftjs_json: {},
    });
  });
  it('enables and disables save in accordance with the error status', async () => {
    const { rerender } = render(
      <Editor>
        <ProjectDescriptionBuilderTopBar
          selectedLocale="en"
          hasError={true}
          onSelectLocale={() => {}}
          previewEnabled={false}
          setPreviewEnabled={() => {}}
          contentBuildableId="2"
          contentBuildableType="project"
          backPath="/projects"
          titleMultiloc={{ en: 'Test Project' }}
          previewPath="/projects/preview"
        />
      </Editor>
    );

    const saveButton = within(
      screen.getByTestId('contentBuilderTopBarSaveButton')
    ).getByRole('button');

    expect(saveButton).toHaveAttribute('aria-disabled', 'true');
    rerender(
      <Editor>
        <ProjectDescriptionBuilderTopBar
          selectedLocale="en"
          hasError={false}
          onSelectLocale={() => {}}
          previewEnabled={false}
          setPreviewEnabled={() => {}}
          contentBuildableId="2"
          contentBuildableType="project"
          backPath="/projects"
          titleMultiloc={{ en: 'Test Project' }}
          previewPath="/projects/preview"
        />
      </Editor>
    );

    expect(saveButton).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('calls setPreviewEnabled correctly on toggle change when previewEnabled is false', async () => {
    const setPreviewEnabled = jest.fn();
    render(
      <Editor>
        <ProjectDescriptionBuilderTopBar
          selectedLocale="en"
          hasError={false}
          onSelectLocale={() => {}}
          previewEnabled={false}
          setPreviewEnabled={setPreviewEnabled}
          contentBuildableId="2"
          contentBuildableType="project"
          backPath="/projects"
          titleMultiloc={{ en: 'Test Project' }}
          previewPath="/projects/preview"
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
        <ProjectDescriptionBuilderTopBar
          selectedLocale="en"
          hasError={false}
          onSelectLocale={() => {}}
          previewEnabled={true}
          setPreviewEnabled={setPreviewEnabled}
          contentBuildableId="2"
          contentBuildableType="project"
          backPath="/projects"
          titleMultiloc={{ en: 'Test Project' }}
          previewPath="/projects/preview"
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
        <ProjectDescriptionBuilderTopBar
          selectedLocale="en"
          hasError={false}
          onSelectLocale={() => {}}
          previewEnabled={false}
          setPreviewEnabled={() => {}}
          contentBuildableId="2"
          contentBuildableType="project"
          backPath="/projects"
          titleMultiloc={{ en: 'Test Project' }}
          previewPath="/projects/preview"
        />
      </Editor>
    );
    expect(screen.queryByText('en')).not.toBeInTheDocument();
  });

  it('renders locale switcher when there is more than one locale', () => {
    mockLocalesData = ['en', 'fr-FR'];
    const { container } = render(
      <Editor>
        <ProjectDescriptionBuilderTopBar
          selectedLocale="en"
          hasError={false}
          onSelectLocale={() => {}}
          previewEnabled={false}
          setPreviewEnabled={() => {}}
          contentBuildableId="2"
          contentBuildableType="project"
          backPath="/projects"
          titleMultiloc={{ en: 'Test Project' }}
          previewPath="/projects/preview"
        />
      </Editor>
    );
    expect(container.querySelector('#e2e-locale-select')).toBeInTheDocument();
  });

  it('calls onSelectLocale correctly when the locale is changed', () => {
    mockLocalesData = ['en', 'fr-FR'];
    const onSelectLocale = jest.fn();
    const { container } = render(
      <Editor>
        <ProjectDescriptionBuilderTopBar
          selectedLocale="en"
          hasError={false}
          onSelectLocale={onSelectLocale}
          previewEnabled={false}
          setPreviewEnabled={() => {}}
          contentBuildableId="2"
          contentBuildableType="project"
          backPath="/projects"
          titleMultiloc={{ en: 'Test Project' }}
          previewPath="/projects/preview"
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
    const onSelectLocale = jest.fn();
    render(
      <Editor>
        <ProjectDescriptionBuilderTopBar
          hasPendingState={true}
          selectedLocale="en"
          hasError={false}
          onSelectLocale={onSelectLocale}
          previewEnabled={false}
          setPreviewEnabled={() => {}}
          contentBuildableId="2"
          contentBuildableType="project"
          backPath="/projects"
          titleMultiloc={{ en: 'Test Project' }}
          previewPath="/projects/preview"
        />
      </Editor>
    );
    expect(screen.getByText('Save')).not.toBeInTheDocument;
  });
});
