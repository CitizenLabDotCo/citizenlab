import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import ProjectDescriptionBuilderPreview from '.';

let mockFeatureFlagData = true;

jest.mock('utils/cl-router/withRouter', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return <Component {...props} params={{ slug: 'slug' }} />;
      };
    },
  };
});

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => mockFeatureFlagData));

jest.mock('api/projects/useProjectBySlug', () => {
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

describe('ProjectDescriptionBuilderPreview', () => {
  it('calls onMount correctly and renders component when feature flag is enabled', () => {
    const onMount = jest.fn();
    render(<ProjectDescriptionBuilderPreview onMount={onMount} />);

    expect(onMount).toHaveBeenCalled();
    expect(
      screen.getByTestId('projectDescriptionBuilderPreview')
    ).toBeInTheDocument();
  });

  it('does not call onMount and does not render component when feature flag is disabled', () => {
    mockFeatureFlagData = false;
    const onMount = jest.fn();
    render(<ProjectDescriptionBuilderPreview onMount={onMount} />);

    expect(onMount).not.toHaveBeenCalled();
    expect(
      screen.queryByTestId('projectDescriptionBuilderPreview')
    ).not.toBeInTheDocument();
  });
});
