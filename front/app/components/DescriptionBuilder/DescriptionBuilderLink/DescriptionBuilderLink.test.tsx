import React from 'react';

import { useParams } from '@tanstack/react-router';

import { render, screen } from 'utils/testUtils/rtl';

import DescriptionBuilderLink from '.';

(useParams as jest.Mock).mockReturnValue({ projectId: 'projectId' });

const renderComponent = (
  contentBuildableType: 'project' | 'folder' = 'project'
) =>
  render(
    <DescriptionBuilderLink contentBuildableType={contentBuildableType} />
  );

describe('DescriptionBuilderLink', () => {
  it('renders only the Content Builder link — no toggle, no WYSIWYG editor', () => {
    renderComponent();

    expect(
      screen.getByText('Edit description in Content Builder')
    ).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
