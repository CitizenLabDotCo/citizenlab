import React from 'react';
import { render, screen, fireEvent, act, within } from 'utils/testUtils/rtl';
import ContentBuilderTopBar from '.';
import { Editor } from '@craftjs/core';
import {
  IContentBuilderLayoutData,
  addContentBuilderLayout,
} from '../../../services/projectDescriptionBuilder';
import clHistory from 'utils/cl-router/history';

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

jest.mock('utils/cl-router/Link');

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
    useEditor: () => ({
      query: {
        getSerializedNodes: jest.fn(() => {
          return {};
        }),
      },
    }),
  };
});

describe('ContentBuilderTopBar', () => {
  it('renders with correct project name', () => {
    render(
      <Editor>
        <ContentBuilderTopBar
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
        <ContentBuilderTopBar
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
        <ContentBuilderTopBar
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

    expect(addContentBuilderLayout).toHaveBeenCalledWith(
      { code: 'project_description', projectId: 'id' },
      { craftjs_jsonmultiloc: { en: {} } }
    );
  });
  it('enables and disables save in accordance with the error status', async () => {
    const { rerender } = render(
      <Editor>
        <ContentBuilderTopBar
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
        <ContentBuilderTopBar
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
        <ContentBuilderTopBar
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
        <ContentBuilderTopBar
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
        <ContentBuilderTopBar
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
        <ContentBuilderTopBar
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
        <ContentBuilderTopBar
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
        <ContentBuilderTopBar
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
        <ContentBuilderTopBar
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
