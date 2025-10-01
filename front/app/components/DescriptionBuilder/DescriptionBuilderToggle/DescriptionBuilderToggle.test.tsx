import React from 'react';

import { Multiloc } from 'typings';

import { render, screen } from 'utils/testUtils/rtl';

import DescriptionBuilderToggle from '.';

const DEFAULT_DESCRIPTION_BUILDER_LAYOUT_DATA = {
  data: {
    attributes: {
      enabled: false,
    },
  },
};

const mockDescriptionBuilderLayoutData: typeof DEFAULT_DESCRIPTION_BUILDER_LAYOUT_DATA =
  DEFAULT_DESCRIPTION_BUILDER_LAYOUT_DATA;

jest.mock('api/content_builder/useContentBuilderLayout', () => () => {
  return {
    data: mockDescriptionBuilderLayoutData,
  };
});

const mockAddDescriptionBuilderLayout = jest.fn();
jest.mock('api/content_builder/useAddContentBuilderLayout', () =>
  jest.fn(() => ({ mutateAsync: mockAddDescriptionBuilderLayout }))
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

describe('DescriptionBuilderToggle', () => {
  it('shows confirm link  appropriately when builder option toggled', () => {
    render(
      <DescriptionBuilderToggle
        valueMultiloc={multiloc}
        onChange={dummyFunction}
        label={'QuillLabel'}
        modelType="project"
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
    expect(mockAddDescriptionBuilderLayout).toHaveBeenCalledWith({
      projectId: 'projectId',
      enabled: true,
    });
  });

  it('shows confirm Quill editor appropriately when builder option toggled', () => {
    render(
      <DescriptionBuilderToggle
        valueMultiloc={multiloc}
        onChange={dummyFunction}
        label={'QuillLabel'}
        modelType="project"
        {...routerProps}
      />
    );
    const toggle = screen.getByRole('checkbox');
    expect(screen.queryByText('QuillLabel')).toBeInTheDocument();
    toggle.click();
    expect(screen.queryByText('QuillLabel')).not.toBeInTheDocument();
    expect(mockAddDescriptionBuilderLayout).toHaveBeenCalledWith({
      projectId: 'projectId',
      enabled: true,
    });
  });

  it('does not render component when feature flag is not active', () => {
    mockFeatureFlagData = false;
    render(
      <DescriptionBuilderToggle
        valueMultiloc={multiloc}
        onChange={dummyFunction}
        label={'QuillLabel'}
        modelType="project"
        {...routerProps}
      />
    );
    expect(
      screen.queryByTestId('DescriptionBuilderToggle')
    ).not.toBeInTheDocument();
  });
});
