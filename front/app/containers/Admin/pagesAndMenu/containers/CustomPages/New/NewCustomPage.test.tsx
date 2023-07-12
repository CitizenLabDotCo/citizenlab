import React from 'react';
import NewCustomPage from './NewCustomPage';
import { render, screen } from 'utils/testUtils/rtl';

jest.mock('api/topics/useTopics');
jest.mock('api/areas/useAreas');
jest.mock('hooks/useLocale');
jest.mock('api/app_configuration/useAppConfiguration');

describe('NewCustomPage', () => {
  it('does not show the slug input field', () => {
    render(<NewCustomPage />);
    expect(screen.queryByLabelText('Slug')).not.toBeInTheDocument();
  });
});
