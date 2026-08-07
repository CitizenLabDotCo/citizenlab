import React from 'react';

import { render } from 'utils/testUtils/rtl';

import DescriptionBuilderEditModePreview from '.';

describe('DescriptionBuilderEditModePreview', () => {
  it('renders iframe with the correct src', () => {
    const { container } = render(
      <DescriptionBuilderEditModePreview contentBuildableId="id" />
    );
    expect(container.querySelector('iframe')).toHaveAttribute(
      'src',
      '/en/admin/description-builder/folders/id/preview?selected_locale=en'
    );
  });
});
