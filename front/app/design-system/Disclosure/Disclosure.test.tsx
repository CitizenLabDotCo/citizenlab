import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import Disclosure from '.';

describe('Disclosure', () => {
  it('puts its trigger inside a heading', () => {
    render(<Disclosure title="Dates">Body</Disclosure>);

    const heading = screen.getByRole('heading', { name: 'Dates' });

    expect(
      screen.getByRole('button', { name: 'Dates', expanded: false })
    ).toBeInTheDocument();
    expect(heading).toContainElement(screen.getByRole('button'));
  });
});
