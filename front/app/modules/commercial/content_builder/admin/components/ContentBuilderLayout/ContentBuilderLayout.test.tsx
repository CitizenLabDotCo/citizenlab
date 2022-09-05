import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import ContentBuilderLayout from './';

let mockLocationData = { pathname: 'admin/content-builder' };
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

jest.mock('utils/cl-router/Link');
jest.mock('hooks/useFeatureFlag', () => jest.fn(() => mockFeatureFlagData));

describe('ContentBuilderLayout', () => {
  it('calls onMount correctly and renders children when pathname is admin/content-builder and feature flag is enabled', () => {
    const onMount = jest.fn();
    render(
      <ContentBuilderLayout onMount={onMount}>
        <p>Child</p>
      </ContentBuilderLayout>
    );

    expect(onMount).toHaveBeenCalledWith(true);
    expect(screen.getByText('Child')).toBeInTheDocument();
  });
  it('calls onMount correctly and does not render children when pathname is not admin/content-builder', () => {
    mockLocationData = { pathname: 'admin' };
    const onMount = jest.fn();
    render(
      <ContentBuilderLayout onMount={onMount}>
        <p>Child</p>
      </ContentBuilderLayout>
    );

    expect(onMount).toHaveBeenCalledWith(false);
    expect(screen.queryByText('Child')).not.toBeInTheDocument();
  });
  it('calls onMount correctly and does not render children when feature flag is disabled', () => {
    mockFeatureFlagData = false;
    mockLocationData = { pathname: 'admin/content-builder' };
    const onMount = jest.fn();
    render(
      <ContentBuilderLayout onMount={onMount}>
        <p>Child</p>
      </ContentBuilderLayout>
    );

    expect(onMount).toHaveBeenCalledWith(false);
    expect(screen.queryByText('Child')).not.toBeInTheDocument();
  });
});
