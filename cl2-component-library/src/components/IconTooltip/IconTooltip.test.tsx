import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../utils/testUtils/rtl';
import IconTooltip from '.';

const tooltipText = 'toolip text';
describe('<IconTooltip />', () => {
  it('renders', () => {
    render(<IconTooltip content={<div>{tooltipText}</div>} />);
    expect(screen.getByTestId('tooltip-icon-button')).toBeInTheDocument();
  });

  it('renders content on mouseEnter', () => {
    render(<IconTooltip content={<div>{tooltipText}</div>} />);

    fireEvent.mouseEnter(screen.getByTestId('tooltip-icon-button'));
    expect(screen.getByText(tooltipText)).toBeInTheDocument();
  });

  it('hides content mouseLeave', async () => {
    render(<IconTooltip content={<div>{tooltipText}</div>} />);

    fireEvent.mouseOver(screen.getByTestId('tooltip-icon-button'));
    fireEvent.mouseOut(screen.getByTestId('tooltip-icon-button'));
    await waitFor(() => {
      expect(screen.queryByText(tooltipText)).not.toBeInTheDocument();
    });
  });
});
