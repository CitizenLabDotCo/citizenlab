import React from 'react';

import { render, screen } from '../../utils/testUtils/rtl';

import IconButton from '.';

describe('<IconButton />', () => {
  const noop = () => {};

  it('renders', () => {
    render(
      <IconButton
        iconName="close"
        a11y_buttonActionMessage="Test"
        iconColor="red"
        iconColorOnHover="green"
        iconWidth="30px"
        iconHeight="30px"
        data-testid="icon-button"
        onClick={noop}
      />
    );
    expect(screen.getByTestId('icon-button')).toBeInTheDocument();
  });
});
