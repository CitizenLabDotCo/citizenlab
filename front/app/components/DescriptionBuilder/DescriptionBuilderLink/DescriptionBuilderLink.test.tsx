import React from 'react';

import { useParams } from '@tanstack/react-router';

import { render, screen } from 'utils/testUtils/rtl';

import DescriptionBuilderLink from '.';

(useParams as jest.Mock).mockReturnValue({ projectFolderId: 'folderId' });

describe('DescriptionBuilderLink', () => {
  it('renders only the Content Builder link — no toggle, no WYSIWYG editor', () => {
    render(<DescriptionBuilderLink />);

    expect(
      screen.getByText('Edit description in Content Builder')
    ).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
