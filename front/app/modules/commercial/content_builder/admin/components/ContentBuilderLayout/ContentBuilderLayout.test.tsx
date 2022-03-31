import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import ContentBuilderLayout from './';

let mockLocationData = { pathname: 'admin/content-builder' };
let mockFeatureFlagData = true;

jest.mock('react-router', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return <Component {...props} location={mockLocationData} />;
      };
    },
    Link: () => 'LinkText',
  };
});

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
  it('does not call onMount and does not render children when pathname is not admin/content-builder', () => {
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
  it('does not call onMount and does not render children when feature flag is disabled', () => {
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
