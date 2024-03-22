import React from 'react';

import { colors } from '../../utils/styleUtils';
import { render, screen, fireEvent } from '../../utils/testUtils/rtl';

import CardButton, { backgroundColor } from '.';

describe('<CardButton />', () => {
  it('renders', () => {
    const handleClick = jest.fn();
    render(
      <CardButton
        title="Test CardButton"
        subtitle="Test"
        onClick={handleClick}
      />
    );

    expect(screen.getByText('Test CardButton')).toBeInTheDocument();
  });

  it('updates correctly when clicked', () => {
    let selected = true;

    const handleClick = () => {
      selected = !selected;
    };

    const { rerender, container } = render(
      <CardButton
        selected={selected}
        title="Test CardButton"
        subtitle="Test"
        onClick={handleClick}
      />
    );

    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveStyle(`background: ${backgroundColor}`);

    if (!button) throw new Error();

    fireEvent.click(button);

    rerender(
      <CardButton
        selected={selected}
        title="Test CardButton"
        subtitle="Test"
        onClick={handleClick}
      />
    );

    expect(selected).toBe(false);
    expect(button).toHaveStyle(`background: ${colors.white}`);

    fireEvent.click(button);

    rerender(
      <CardButton
        selected={selected}
        title="Test CardButton"
        subtitle="Test"
        onClick={handleClick}
      />
    );

    expect(selected).toBe(true);
    expect(button).toHaveStyle(`background: ${backgroundColor}`);
  });
});
