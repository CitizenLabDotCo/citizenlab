import React from 'react';

import { useLocation } from '@tanstack/react-router';

import { render, screen } from 'utils/testUtils/rtl';

import ProjectDescriptionBuilderLayout from '.';

let mockFeatureFlagData = true;

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => mockFeatureFlagData));

describe('ProjectDescriptionBuilderLayout', () => {
  it('calls onMount correctly and renders children when pathname is admin/project-description-builder and feature flag is enabled', () => {
    (useLocation as jest.Mock).mockReturnValue({
      pathname: 'admin/project-description-builder',
      search: '',
      hash: '',
      href: '/',
      state: {},
    });
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
    (useLocation as jest.Mock).mockReturnValue({
      pathname: 'admin',
      search: '',
      hash: '',
      href: '/',
      state: {},
    });
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
    (useLocation as jest.Mock).mockReturnValue({
      pathname: 'admin/project-description-builder',
      search: '',
      hash: '',
      href: '/',
      state: {},
    });
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
