import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';

import InsightsEdit from './';

jest.mock('modules', () => jest.fn());

jest.mock('modules/commercial/insights/api/views', () => {
  return {
    useUpdateView: jest.fn(() => {
      return { mutate: jest.fn() };
    }),
  };
});

describe('Insights Edit', () => {
  it('renders Edit screen', () => {
    render(<InsightsEdit />);
    expect(screen.getByTestId('insightsEdit')).toBeInTheDocument();
  });
});
