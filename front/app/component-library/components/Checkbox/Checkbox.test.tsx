import React from 'react';

import { render, screen, fireEvent } from '../../utils/testUtils/rtl';

import Checkbox from '.';

describe('<Checkbox />', () => {
  it('renders', () => {
    const handleChange = jest.fn();
    render(
      <Checkbox checked={true} label="Test checkbox" onChange={handleChange} />
    );
    expect(screen.getByLabelText('Test checkbox')).toBeInTheDocument();
  });

  it('renders check mark when checked={true}', () => {
    const handleChange = () => {};

    render(
      <Checkbox checked={true} label="Test checkbox" onChange={handleChange} />
    );
    expect(screen.queryByTestId('check-mark')).toBeInTheDocument();
  });

  it('renders check mark when checkedColor is set', () => {
    const handleChange = () => {};

    render(
      <Checkbox
        checked={true}
        checkedColor={'black'}
        label="Test checkbox"
        onChange={handleChange}
      />
    );
    expect(screen.queryByTestId('check-mark')).toBeInTheDocument();
    expect(screen.queryByTestId('check-mark-background')).toHaveStyle(
      'background: rgb(0, 0, 0)'
    );
  });

  it('renders check mark when layerPadding is set', () => {
    const handleChange = () => {};

    render(
      <Checkbox
        checked={true}
        padding="20px"
        label="Test checkbox"
        onChange={handleChange}
      />
    );
    expect(screen.queryByTestId('check-mark-label')).toBeInTheDocument();
    expect(screen.queryByTestId('check-mark-label')).toHaveStyle(
      'padding: 20px'
    );
  });

  it('does not render check mark when checked={false}', () => {
    const handleChange = () => {};

    render(
      <Checkbox checked={false} label="Test checkbox" onChange={handleChange} />
    );
    expect(screen.queryByTestId('check-mark')).not.toBeInTheDocument();
  });

  it('updates correctly when clicked', () => {
    let checked = true;

    const handleChange = () => {
      checked = !checked;
    };

    const { rerender } = render(
      <Checkbox
        checked={checked}
        label="Test checkbox"
        onChange={handleChange}
      />
    );

    const checkbox = screen.getByLabelText('Test checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(screen.getByTestId('check-mark')).toBeInTheDocument();

    fireEvent.click(checkbox);

    rerender(
      <Checkbox
        checked={checked}
        label="Test checkbox"
        onChange={handleChange}
      />
    );

    expect(checked).toBe(false);
    expect(screen.queryByTestId('check-mark')).not.toBeInTheDocument();

    fireEvent.click(checkbox);

    rerender(
      <Checkbox
        checked={checked}
        label="Test checkbox"
        onChange={handleChange}
      />
    );

    expect(checked).toBe(true);
    expect(screen.getByTestId('check-mark')).toBeInTheDocument();
  });
});
