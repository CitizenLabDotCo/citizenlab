import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import BarRow from '.';

describe('BarRow', () => {
  it('exposes the share as a labelled meter', () => {
    render(<BarRow label="Proposed" value="18% · 6" share={0.18} />);

    const meter = screen.getByRole('meter', { name: 'Proposed' });
    expect(meter).toHaveAttribute('aria-valuenow', '18');
    expect(meter).toHaveAttribute('aria-valuetext', '18% · 6');
  });

  it('keeps the bar between empty and full', () => {
    render(<BarRow label="Proposed" value="140%" share={1.4} />);

    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '100');
  });
});
