import React from 'react';

import { render } from 'utils/testUtils/rtl';

import ProjectDescriptionBuilderEditModePreview from '.';

jest.mock('api/projects/useProjectById', () => {
  return jest.fn(() => ({
    data: {
      data: {
        id: 'id',
        type: 'project',
        attributes: {
          title_multiloc: { en: 'Test Project' },
          slug: 'test',
        },
      },
    },
  }));
});

describe('ProjectDescriptionBuilderEditModePreview', () => {
  it('renders iframe with the correct src', () => {
    const { container } = render(
      <ProjectDescriptionBuilderEditModePreview contentBuildableId="id" />
    );
    expect(container.querySelector('iframe')).toHaveAttribute(
      'src',
      '/en/admin/description-builder/projects/id/preview?selected_locale=en'
    );
  });
});
