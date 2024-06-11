import React from 'react';

import { colors } from '../../utils/styleUtils';
import { render, screen } from '../../utils/testUtils/rtl';

import StatusLabel from '.';

describe('<StatusLabel />', () => {
  it('renders the default variant properly', () => {
    render(<StatusLabel text="Test StatusLabel" backgroundColor="#ffffff" />);
    expect(screen.getByText('Test StatusLabel')).toBeInTheDocument();
  });

  it('renders the passed-in background color properly', () => {
    render(<StatusLabel text="Border Test" backgroundColor="#ffffff" />);
    expect(screen.getByText('Border Test')).toHaveStyle({
      backgroundColor: '#ffffff',
    });
  });

  it('renders with an icon properly', () => {
    render(
      <StatusLabel
        text="Test StatusLabel"
        backgroundColor="#ffffff"
        icon="lock"
      />
    );
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('renders without a border normally', () => {
    render(<StatusLabel text="Border Test" backgroundColor="#ffffff" />);
    const statusLabel = screen.getByText('Border Test');
    const style = window.getComputedStyle(statusLabel);
    expect(style.border).toBe('');
  });

  it('renders with a border with variant: outlined', () => {
    render(
      <StatusLabel
        text="Border Test"
        backgroundColor="#ffffff"
        variant="outlined"
      />
    );
    const statusLabel = screen.getByText('Border Test');
    const style = window.getComputedStyle(statusLabel);
    expect(style.border.toLowerCase()).toBe(
      `1px solid ${colors.textSecondary}`.toLowerCase()
    );
  });
});
