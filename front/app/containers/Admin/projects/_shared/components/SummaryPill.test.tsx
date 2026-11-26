import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import SummaryPill, { SummaryReviewedContext } from './SummaryPill';

describe('SummaryPill', () => {
  it('is grey until its card is reviewed', () => {
    render(<SummaryPill label="List" />);

    expect(
      screen.getByText('List').closest('[class*="neutral"]')
    ).not.toBeNull();
  });

  it('turns blue once its card is reviewed', () => {
    render(
      <SummaryReviewedContext.Provider value>
        <SummaryPill label="List" />
      </SummaryReviewedContext.Provider>
    );

    expect(
      screen.getByText('List').closest('[class*="selected"]')
    ).not.toBeNull();
  });
});
