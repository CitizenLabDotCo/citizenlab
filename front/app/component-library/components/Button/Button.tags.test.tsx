import React from 'react';

import { render } from '../../utils/testUtils/rtl';

import Button from '.';

const FLAG = 'VITE_GV_DESIGN_TAGS';

describe('design tags', () => {
  const original = process.env[FLAG];
  afterEach(() => {
    if (original === undefined) delete process.env[FLAG];
    else process.env[FLAG] = original;
  });

  it('tags the Button root and a nested Icon when the flag is 1', () => {
    process.env[FLAG] = '1';
    const { container } = render(<Button icon="check">Save</Button>);

    expect(container.firstElementChild).toHaveAttribute(
      'data-gv-component',
      'Button'
    );
    expect(
      container.querySelector('[data-gv-component="Icon"]')
    ).toBeInTheDocument();
  });

  it('adds no attribute when the flag is unset', () => {
    delete process.env[FLAG];
    const { container } = render(<Button icon="check">Save</Button>);

    expect(container.querySelector('[data-gv-component]')).toBeNull();
  });
});
