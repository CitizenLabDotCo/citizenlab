import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';

import ContentBuilderMobileView from './';

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

describe('ContentBulderMobileView', () => {
  it('renders iframe with the correct src', () => {
    render(<ContentBuilderMobileView projectId="id" />);
    expect(
      screen.getByTitle('Project description mobile preview')
    ).toHaveAttribute('src', '/en/projects/test');
  });
});
