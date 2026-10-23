import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import ModeScope from './ModeScope';

describe('ModeScope', () => {
  it('defaults to the redesign mode and keeps layout with display: contents', () => {
    render(
      <ModeScope>
        <span>child</span>
      </ModeScope>
    );
    const wrapper = screen.getByText('child').parentElement as HTMLElement;
    expect(wrapper).toHaveAttribute('data-gv-mode', 'redesign');
    expect(wrapper).toHaveStyle({ display: 'contents' });
  });

  it('accepts another mode', () => {
    render(
      <ModeScope mode="today">
        <span>child</span>
      </ModeScope>
    );
    expect(screen.getByText('child').parentElement).toHaveAttribute(
      'data-gv-mode',
      'today'
    );
  });
});
