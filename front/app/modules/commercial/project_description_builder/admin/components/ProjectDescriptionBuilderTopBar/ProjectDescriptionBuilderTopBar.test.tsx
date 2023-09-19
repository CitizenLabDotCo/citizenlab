import React from 'react';
import { render, screen, fireEvent, act, within } from 'utils/testUtils/rtl';
import ProjectDescriptionBuilderTopBar from '.';
import { Editor } from '@craftjs/core';
import { IProjectDescriptionBuilderData } from 'modules/commercial/project_description_builder/api/types';
import clHistory from 'utils/cl-router/history';

const mockEditorData: IProjectDescriptionBuilderData = {
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

jest.mock(
  'modules/commercial/project_description_builder/api/useProjectDescriptionBuilderLayout',
  () => () => {
    return {
      data: mockEditorData,
    };
  }
);

const mockAddProjectDescriptionBuilderLayout = jest.fn();
jest.mock(
  'modules/commercial/project_description_builder/api/useAddProjectDescriptionBuilderLayout',
  () => jest.fn(() => ({ mutateAsync: mockAddProjectDescriptionBuilderLayout }))
);

let mockLocalesData = ['en'];
jest.mock('hooks/useAppConfigurationLocales', () =>
  jest.fn(() => mockLocalesData)
);

const mockParams = { projectId: 'id' };

jest.mock('utils/cl-router/withRouter', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return <Component {...props} params={mockParams} />;
      };
    },
  };
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockParams,
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
          localesWithError={[]}
          onSelectLocale={() => {}}
          previewEnabled={false}
          setPreviewEnabled={() => {}}
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
          localesWithError={[]}
          onSelectLocale={() => {}}
          previewEnabled={false}
          setPreviewEnabled={() => {}}
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
          localesWithError={[]}
          onSelectLocale={() => {}}
          previewEnabled={false}
          setPreviewEnabled={() => {}}
          draftEditorData={{ en: {} }}
        />
      </Editor>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('contentBuilderTopBarSaveButton'));
    });

    expect(mockAddProjectDescriptionBuilderLayout).toHaveBeenCalledWith({
      projectId: 'id',
      craftjs_jsonmultiloc: { en: {} },
    });
  });
  it('enables and disables save in accordance with the error status', async () => {
    const { rerender } = render(
      <Editor>
        <ProjectDescriptionBuilderTopBar
          selectedLocale="en"
          localesWithError={['en']}
          onSelectLocale={() => {}}
          previewEnabled={false}
          setPreviewEnabled={() => {}}
        />
      </Editor>
    );

    const saveButton = within(
      screen.getByTestId('contentBuilderTopBarSaveButton')
    ).getByRole('button');

    expect(saveButton).toBeDisabled();
    rerender(
      <Editor>
        <ProjectDescriptionBuilderTopBar
          selectedLocale="en"
          localesWithError={[]}
          onSelectLocale={() => {}}
          previewEnabled={false}
          setPreviewEnabled={() => {}}
        />
      </Editor>
    );

    expect(saveButton).not.toBeDisabled();
  });

  it('calls setPreviewEnabled correctly on toggle change when previewEnabled is false', async () => {
    const setPreviewEnabled = jest.fn();
    render(
      <Editor>
        <ProjectDescriptionBuilderTopBar
          selectedLocale="en"
          localesWithError={[]}
          onSelectLocale={() => {}}
          previewEnabled={false}
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
        <ProjectDescriptionBuilderTopBar
          selectedLocale="en"
          localesWithError={[]}
          onSelectLocale={() => {}}
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
        <ProjectDescriptionBuilderTopBar
          selectedLocale="en"
          localesWithError={[]}
          onSelectLocale={() => {}}
          previewEnabled={false}
          setPreviewEnabled={() => {}}
        />
      </Editor>
    );
    expect(screen.queryByText('en')).not.toBeInTheDocument();
  });

  it('renders locale switcher when there is only one locale', () => {
    mockLocalesData = ['en', 'fr-FR'];
    render(
      <Editor>
        <ProjectDescriptionBuilderTopBar
          selectedLocale="en"
          localesWithError={[]}
          onSelectLocale={() => {}}
          previewEnabled={false}
          setPreviewEnabled={() => {}}
        />
      </Editor>
    );
    expect(screen.getByText('en')).toBeInTheDocument();
  });

  it('calls onSelectLocale correctly when the locale is changed', () => {
    const onSelectLocale = jest.fn();
    render(
      <Editor>
        <ProjectDescriptionBuilderTopBar
          selectedLocale="en"
          localesWithError={[]}
          onSelectLocale={onSelectLocale}
          previewEnabled={false}
          setPreviewEnabled={() => {}}
        />
      </Editor>
    );
    fireEvent.click(screen.getByText('fr-FR'));
    expect(onSelectLocale).toHaveBeenCalledWith({
      editorData: {},
      locale: 'fr-FR',
    });
  });

  it('shows locale switcher error correctly', () => {
    const onSelectLocale = jest.fn();
    render(
      <Editor>
        <ProjectDescriptionBuilderTopBar
          selectedLocale="en"
          localesWithError={['en']}
          onSelectLocale={onSelectLocale}
          previewEnabled={false}
          setPreviewEnabled={() => {}}
        />
      </Editor>
    );
    expect(screen.getByText('en').firstChild).toHaveClass('empty');
  });

  it('sets Save button to pending state correctly', () => {
    const onSelectLocale = jest.fn();
    render(
      <Editor>
        <ProjectDescriptionBuilderTopBar
          hasPendingState={true}
          selectedLocale="en"
          localesWithError={['en']}
          onSelectLocale={onSelectLocale}
          previewEnabled={false}
          setPreviewEnabled={() => {}}
        />
      </Editor>
    );
    expect(screen.getByText('Save')).not.toBeInTheDocument;
  });
});
