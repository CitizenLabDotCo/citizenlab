import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';

import InsightsEdit from './';

jest.mock('modules/commercial/insights/api/views/useView');

describe('Insights Edit', () => {
  it('renders Edit screen', () => {
    render(<InsightsEdit />);
    expect(screen.getByTestId('insightsEdit')).toBeInTheDocument();
  });
});
