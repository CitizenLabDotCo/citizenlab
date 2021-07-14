import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';

import InsightsEdit from './';

describe('Insights Edit', () => {
  it('renders Edit screen', () => {
    render(<InsightsEdit />);
    expect(screen.getByTestId('insightsEdit')).toBeInTheDocument();
  });
});
