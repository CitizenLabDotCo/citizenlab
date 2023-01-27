import React from 'react';
import { render } from 'utils/testUtils/rtl';

import ProjectDescriptionBuilderEditModePreview from '.';

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

describe('ProjectDescriptionBuilderEditModePreview', () => {
  it('renders iframe with the correct src', () => {
    const { container } = render(
      <ProjectDescriptionBuilderEditModePreview projectId="id" />
    );
    expect(container.querySelector('iframe')).toHaveAttribute(
      'src',
      '/en/admin/project-description-builder/projects/id/preview'
    );
  });
});
