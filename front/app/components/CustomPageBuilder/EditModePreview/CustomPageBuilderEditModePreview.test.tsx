import React from 'react';

import { render } from 'utils/testUtils/rtl';

import CustomPageBuilderEditModePreview from '.';

describe('CustomPageBuilderEditModePreview', () => {
  it('renders iframe with the correct src', () => {
    const { container } = render(
      <CustomPageBuilderEditModePreview staticPageId="page-1" />
    );

    expect(container.querySelector('iframe')).toHaveAttribute(
      'src',
      '/en/admin/custom-page-builder/pages/page-1/preview?selected_locale=en'
    );
  });

  it('previews in the selected locale when one is chosen', () => {
    const { container } = render(
      <CustomPageBuilderEditModePreview
        staticPageId="page-1"
        selectedLocale="nl-BE"
      />
    );

    expect(container.querySelector('iframe')).toHaveAttribute(
      'src',
      '/nl-BE/admin/custom-page-builder/pages/page-1/preview?selected_locale=nl-BE'
    );
  });
});
