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

const mockProjectDescriptionBuilderLayoutData: typeof DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA =
  DEFAULT_PROJECT_DESCRIPTION_BUILDER_LAYOUT_DATA;

jest.mock(
  'modules/commercial/project_description_builder/api/useProjectDescriptionBuilderLayout',
  () => () => {
    return {
      data: mockProjectDescriptionBuilderLayoutData,
    };
  }
);

const mockAddProjectDescriptionBuilderLayout = jest.fn();
jest.mock(
  'modules/commercial/project_description_builder/api/useAddProjectDescriptionBuilderLayout',
  () => jest.fn(() => ({ mutateAsync: mockAddProjectDescriptionBuilderLayout }))
);

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
    expect(
      screen.queryByText('Edit description in Content Builder')
    ).not.toBeInTheDocument();
    toggle.click();
    expect(
      screen.getByText('Edit description in Content Builder')
    ).toBeInTheDocument();
    expect(mockAddProjectDescriptionBuilderLayout).toHaveBeenCalledWith({
      projectId: 'projectId',
      enabled: true,
    });
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
    expect(mockAddProjectDescriptionBuilderLayout).toHaveBeenCalledWith({
      projectId: 'projectId',
      enabled: true,
    });
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
