import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import NewCustomPage from './NewCustomPage';

jest.mock('api/global_topics/useGlobalTopics');
jest.mock('api/areas/useAreas');
jest.mock('hooks/useLocale');
jest.mock('api/app_configuration/useAppConfiguration');

describe('NewCustomPage', () => {
  it('does not show the slug input field', () => {
    render(<NewCustomPage />);
    expect(screen.queryByLabelText('Slug')).not.toBeInTheDocument();
  });
});
