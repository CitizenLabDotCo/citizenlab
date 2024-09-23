import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import ProjectDescriptionBuilderLayout from '.';

let mockLocationData = { pathname: 'admin/project-description-builder' };
let mockFeatureFlagData = true;

jest.mock('utils/cl-router/withRouter', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return <Component {...props} location={mockLocationData} />;
      };
    },
  };
});

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => mockFeatureFlagData));

describe('ProjectDescriptionBuilderLayout', () => {
  it('calls onMount correctly and renders children when pathname is admin/project-description-builder and feature flag is enabled', () => {
    const onMount = jest.fn();
    render(
      <ProjectDescriptionBuilderLayout onMount={onMount}>
        <p>Child</p>
      </ProjectDescriptionBuilderLayout>
    );

    expect(onMount).toHaveBeenCalledWith(true);
    expect(screen.getByText('Child')).toBeInTheDocument();
  });
  it('calls onMount correctly and does not render children when pathname is not admin/project-description-builder', () => {
    mockLocationData = { pathname: 'admin' };
    const onMount = jest.fn();
    render(
      <ProjectDescriptionBuilderLayout onMount={onMount}>
        <p>Child</p>
      </ProjectDescriptionBuilderLayout>
    );

    expect(onMount).toHaveBeenCalledWith(false);
    expect(screen.queryByText('Child')).not.toBeInTheDocument();
  });
  it('calls onMount correctly and does not render children when feature flag is disabled', () => {
    mockFeatureFlagData = false;
    mockLocationData = { pathname: 'admin/project-description-builder' };
    const onMount = jest.fn();
    render(
      <ProjectDescriptionBuilderLayout onMount={onMount}>
        <p>Child</p>
      </ProjectDescriptionBuilderLayout>
    );

    expect(onMount).toHaveBeenCalledWith(false);
    expect(screen.queryByText('Child')).not.toBeInTheDocument();
  });
});
