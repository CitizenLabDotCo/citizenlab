import React from 'react';
import { render } from 'utils/testUtils/rtl';

import ContentBuilderEditModePreview from '.';

jest.mock('services/locale');
jest.mock('hooks/useLocale');
jest.mock('utils/cl-intl');
jest.mock('hooks/useProject', () => {
  return jest.fn(() => ({
    id: 'id',
    type: 'project',
    attributes: {
      title_multiloc: { en: 'Test Project' },
      slug: 'test',
    },
  }));
});

describe('ContentBulderEditModePreview', () => {
  it('renders iframe with the correct src', () => {
    const { container } = render(
      <ContentBuilderEditModePreview projectId="id" />
    );
    expect(container.querySelector('iframe')).toHaveAttribute(
      'src',
      '/en/admin/content-builder/projects/id/preview'
    );
  });
});
