import React from 'react';

import { render, screen } from '../../utils/testUtils/rtl';

import Radio from '.';

describe('<Radio />', () => {
  it('renders', () => {
    render(<Radio value="1" name="1" />);
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
  });
  it('does not render label with htmlFor when label is null', () => {
    render(<Radio id="radio-id" label={null} value="1" name="1" />);
    expect(screen.queryByTestId('radio-label')).not.toBeInTheDocument();
  });
  it('does render label with htmlFor when label is not null', () => {
    render(<Radio label={'label'} id="radio-id" value="1" name="1" />);
    expect(screen.getByTestId('radio-label')).toHaveAttribute(
      'for',
      'radio-id'
    );
  });
  it('does render radio with correct padding when padding is set', () => {
    render(
      <Radio label={'label'} id="radio-id" value="1" name="1" padding="20px" />
    );
    expect(screen.queryByTestId('radio-container')).toBeInTheDocument();
    expect(screen.queryByTestId('radio-container')).toHaveStyle(
      'padding: 20px'
    );
  });
});
