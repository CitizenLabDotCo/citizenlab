import React from 'react';

import { render, screen, fireEvent } from '../../utils/testUtils/rtl';

import ColorPickerInput from '.';

describe('<ColorPickerInput />', () => {
  it('renders', () => {
    const onChange = () => {};

    render(
      <ColorPickerInput type="text" value="#c8bdfa" onChange={onChange} />
    );
    expect(screen.getByTestId('selected-color-square')).toHaveAttribute(
      'color',
      '#c8bdfa'
    );
    expect(screen.getByDisplayValue('#c8bdfa')).toBeInTheDocument();
  });

  it('opens and closes when clicked', () => {
    window.HTMLCanvasElement.prototype.getContext = jest.fn();
    const onChange = () => {};

    render(
      <ColorPickerInput type="text" value="#c8bdfa" onChange={onChange} />
    );

    fireEvent.click(screen.getByTestId('selected-color-square'));
    expect(screen.getByTestId('popover')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('cover'));
    expect(screen.queryByTestId('popover')).not.toBeInTheDocument();
  });
});
