import React from 'react';

import { screen, render } from 'utils/testUtils/rtl';

import RemoveImageButton from './';

describe('RemoveImageButton', () => {
  it('renders button with default text for screen reader', () => {
    render(<RemoveImageButton onClick={jest.fn()} />);
    expect(screen.getByRole('button')).toHaveTextContent('Remove');
  });

  it('renders button with specified text for screen reader', () => {
    render(
      <RemoveImageButton
        onClick={jest.fn()}
        removeIconAriaTitle={'Usuń obrazek'}
      />
    );
    expect(screen.getByRole('button')).toHaveTextContent('Usuń obrazek');
  });
});
