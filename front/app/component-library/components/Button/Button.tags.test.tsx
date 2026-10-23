import React from 'react';

import { render } from '../../utils/testUtils/rtl';

import Button from '.';

describe('<Button /> design tags', () => {
  const original = process.env.VITE_GV_DESIGN_TAGS;
  afterEach(() => {
    if (original === undefined) delete process.env.VITE_GV_DESIGN_TAGS;
    else process.env.VITE_GV_DESIGN_TAGS = original;
  });

  it('tags the root and nested library components when the flag is 1', () => {
    process.env.VITE_GV_DESIGN_TAGS = '1';
    const { container } = render(<Button icon="check">Save</Button>);

    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('data-gv-component', 'Button');
    expect(
      container.querySelector('[data-gv-component="Icon"]')
    ).toBeInTheDocument();
  });

  it('adds no attribute when the flag is unset', () => {
    delete process.env.VITE_GV_DESIGN_TAGS;
    const { container } = render(<Button icon="check">Save</Button>);

    expect(container.querySelector('[data-gv-component]')).toBeNull();
  });
});
