import { addProjectDescriptionBuilderLayout } from 'modules/commercial/project_description_builder/services/projectDescriptionBuilder';
import React from 'react';
import { Multiloc } from 'typings';
import { render, screen } from 'utils/testUtils/rtl';
import ProjectDescriptionBuilderToggle from '.';

const DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA = {
  data: {
    attributes: {
      enabled: false,
    },
  },
};

let mockProjectDescriptionBuilderLayoutData:
  | typeof DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA
  | Error;
mockProjectDescriptionBuilderLayoutData =
  DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA;

jest.mock('utils/cl-intl');
jest.mock('services/appConfiguration');
jest.mock('utils/cl-router/history');
jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));
jest.mock('hooks/useAppConfigurationLocales', () => jest.fn(() => ['en']));
jest.mock(
  'modules/commercial/project_description_builder/hooks/useProjectDescriptionBuilderLayout',
  () => {
    return jest.fn(() => mockProjectDescriptionBuilderLayoutData);
  }
);
jest.mock(
  'modules/commercial/project_description_builder/services/projectDescriptionBuilder',
  () => ({
    addProjectDescriptionBuilderLayout: jest.fn(),
  })
);
jest.mock('utils/cl-router/Link', () => () => (
  <a href="www.google.com">LinkText</a>
));

jest.mock('utils/cl-router/withRouter', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return <Component {...props} params={{ projectId: 'projectId' }} />;
      };
    },
  };
});

const dummyFunction = jest.fn();
const multiloc = 'en' as Multiloc;

const routerProps = {
  location: {
    pathname: '/admin/projects/projectID/description',
  },
  params: {
    projectId: 'projectId',
  },
};

let mockFeatureFlagData = true;

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => mockFeatureFlagData));

describe('ProjectDescriptionBuilderToggle', () => {
  it('shows confirm link  appropriately when builder option toggled', () => {
    render(
      <ProjectDescriptionBuilderToggle
        valueMultiloc={multiloc}
        onChange={dummyFunction}
        label={'QuillLabel'}
        labelTooltipText={'LabelTooltipText'}
        onMount={dummyFunction}
        {...routerProps}
      />
    );
    const toggle = screen.getByRole('checkbox');
    expect(screen.queryByText('LinkText')).not.toBeInTheDocument();
    toggle.click();
    expect(screen.queryByText('LinkText')).toBeInTheDocument();
    expect(addProjectDescriptionBuilderLayout).toHaveBeenCalledWith(
      'projectId',
      { enabled: true }
    );
  });
  it('shows confirm Quill editor appropriately when builder option toggled', () => {
    render(
      <ProjectDescriptionBuilderToggle
        valueMultiloc={multiloc}
        onChange={dummyFunction}
        label={'QuillLabel'}
        labelTooltipText={'LabelTooltipText'}
        onMount={dummyFunction}
        {...routerProps}
      />
    );
    const toggle = screen.getByRole('checkbox');
    expect(screen.queryByText('QuillLabel')).toBeInTheDocument();
    toggle.click();
    expect(screen.queryByText('QuillLabel')).not.toBeInTheDocument();
    expect(addProjectDescriptionBuilderLayout).toHaveBeenCalledWith(
      'projectId',
      { enabled: true }
    );
  });
  it('handles ContentBuilderLayout error', () => {
    render(
      <ProjectDescriptionBuilderToggle
        valueMultiloc={multiloc}
        onChange={dummyFunction}
        label={'QuillLabel'}
        labelTooltipText={'LabelTooltipText'}
        onMount={dummyFunction}
        {...routerProps}
      />
    );
    mockProjectDescriptionBuilderLayoutData = new Error();
    const toggle = screen.getByRole('checkbox');
    toggle.click();
    expect(addProjectDescriptionBuilderLayout).toHaveBeenCalledWith(
      'projectId',
      { enabled: true }
    );
  });
  it('does not render component when feature flag is not active', () => {
    mockFeatureFlagData = false;
    render(
      <ProjectDescriptionBuilderToggle
        valueMultiloc={multiloc}
        onChange={dummyFunction}
        label={'QuillLabel'}
        labelTooltipText={'LabelTooltipText'}
        onMount={dummyFunction}
        {...routerProps}
      />
    );
    expect(
      screen.queryByTestId('projectDescriptionBuilderToggle')
    ).not.toBeInTheDocument();
  });
});
