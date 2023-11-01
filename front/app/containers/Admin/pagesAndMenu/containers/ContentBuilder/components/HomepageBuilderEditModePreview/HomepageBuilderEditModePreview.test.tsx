import React from 'react';
import { render } from 'utils/testUtils/rtl';

import HompageBuilderEditModePreview from '.';

describe('HompageBuilderEditModePreview', () => {
  it('renders iframe with the correct src', () => {
    const { container } = render(<HompageBuilderEditModePreview />);
    expect(container.querySelector('iframe')).toHaveAttribute(
      'src',
      '/en/admin/pages-menu/homepage/content-builder/preview'
    );
  });
});
