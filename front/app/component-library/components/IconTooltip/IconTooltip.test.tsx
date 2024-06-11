import React from 'react';

import userEvent from '@testing-library/user-event';

import { render, screen, waitFor } from '../../utils/testUtils/rtl';

import IconTooltip from '.';

const tooltipText = 'toolip text';

describe('<IconTooltip />', () => {
  it('renders', () => {
    render(<IconTooltip content={<div>{tooltipText}</div>} />);
    expect(screen.getByTestId('tooltip-icon-button')).toBeInTheDocument();
  });

  it('shows content when hovering', async () => {
    render(<IconTooltip content={<div>{tooltipText}</div>} />);

    expect(screen.queryByText(tooltipText)).not.toBeInTheDocument();
    userEvent.hover(screen.getByTestId('tooltip-icon-button'));
    await waitFor(() => {
      expect(screen.getByText(tooltipText)).toBeInTheDocument();
    });
  });

  it('hides content when not hovering', async () => {
    render(<IconTooltip content={<div>{tooltipText}</div>} />);

    expect(screen.queryByText(tooltipText)).not.toBeInTheDocument();
  });
});
