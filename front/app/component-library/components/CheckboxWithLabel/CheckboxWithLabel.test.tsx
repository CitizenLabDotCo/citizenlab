import React from 'react';

import { render, screen, fireEvent } from '../../utils/testUtils/rtl';

import CheckboxWithLabel from '.';

describe('<CheckboxWithLabel />', () => {
  it('renders', () => {
    const handleChange = jest.fn();
    render(
      <CheckboxWithLabel
        checked={true}
        label="Test checkbox"
        onChange={handleChange}
      />
    );
    expect(screen.getByLabelText('Test checkbox')).toBeInTheDocument();
  });

  it('renders check mark when checked={true}', () => {
    const handleChange = () => {};

    render(
      <CheckboxWithLabel
        checked={true}
        label="Test checkbox"
        onChange={handleChange}
      />
    );
    expect(screen.queryByTestId('check-mark')).toBeInTheDocument();
  });

  it('renders check mark when checkedColor is set', () => {
    const handleChange = () => {};

    render(
      <CheckboxWithLabel
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
      <CheckboxWithLabel
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
      <CheckboxWithLabel
        checked={false}
        label="Test checkbox"
        onChange={handleChange}
      />
    );
    expect(screen.queryByTestId('check-mark')).not.toBeInTheDocument();
  });

  it('updates correctly when clicked', () => {
    let checked = true;

    const handleChange = () => {
      checked = !checked;
    };

    const { rerender } = render(
      <CheckboxWithLabel
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
      <CheckboxWithLabel
        checked={checked}
        label="Test checkbox"
        onChange={handleChange}
      />
    );

    expect(checked).toBe(false);
    expect(screen.queryByTestId('check-mark')).not.toBeInTheDocument();

    fireEvent.click(checkbox);

    rerender(
      <CheckboxWithLabel
        checked={checked}
        label="Test checkbox"
        onChange={handleChange}
      />
    );

    expect(checked).toBe(true);
    expect(screen.getByTestId('check-mark')).toBeInTheDocument();
  });

  describe('container clicks', () => {
    it('toggles when the container padding is clicked', () => {
      const handleChange = jest.fn();
      render(
        <CheckboxWithLabel
          checked={false}
          padding="20px"
          label="Test checkbox"
          onChange={handleChange}
        />
      );

      fireEvent.click(screen.getByTestId('check-mark-label'));

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith({ target: { checked: true } });
    });

    it('toggles only once when the label is clicked', () => {
      const handleChange = jest.fn();
      render(
        <CheckboxWithLabel
          checked={false}
          label="Test checkbox"
          onChange={handleChange}
        />
      );

      fireEvent.click(screen.getByText('Test checkbox'));

      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('ignores container clicks when disabled', () => {
      const handleChange = jest.fn();
      render(
        <CheckboxWithLabel
          checked={false}
          disabled
          label="Test checkbox"
          onChange={handleChange}
        />
      );

      fireEvent.click(screen.getByTestId('check-mark-label'));

      expect(handleChange).not.toHaveBeenCalled();
    });
  });
});
