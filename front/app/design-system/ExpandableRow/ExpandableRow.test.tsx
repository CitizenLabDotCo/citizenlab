import React from 'react';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import ExpandableRow from '.';

describe('ExpandableRow', () => {
  it('opens its detail when the row is pressed', async () => {
    const user = userEvent.setup();
    render(
      <ExpandableRow title="AI topic distribution" summary="34 inputs">
        Detail
      </ExpandableRow>
    );

    const trigger = screen.getByRole('button', {
      name: /AI topic distribution/,
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Detail')).toBeVisible();
  });
});
