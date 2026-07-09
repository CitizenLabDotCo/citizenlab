import React from 'react';

import { useParams } from '@tanstack/react-router';

import { render, screen } from 'utils/testUtils/rtl';

import DescriptionBuilderLink from '.';

(useParams as jest.Mock).mockReturnValue({ projectId: 'projectId' });

let mockFeatureFlagData = true;
jest.mock('hooks/useFeatureFlag', () => jest.fn(() => mockFeatureFlagData));

const renderComponent = (
  contentBuildableType: 'project' | 'folder' = 'project'
) =>
  render(
    <DescriptionBuilderLink contentBuildableType={contentBuildableType} />
  );

describe('DescriptionBuilderLink', () => {
  beforeEach(() => {
    mockFeatureFlagData = true;
  });

  it('renders only the Content Builder link — no toggle, no WYSIWYG editor', () => {
    renderComponent();

    expect(
      screen.getByText('Edit description in Content Builder')
    ).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('does not render when the feature flag is not active', () => {
    mockFeatureFlagData = false;
    renderComponent();

    expect(
      screen.queryByTestId('descriptionBuilderLink')
    ).not.toBeInTheDocument();
  });
});
