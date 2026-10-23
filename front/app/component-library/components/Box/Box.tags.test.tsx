import React from 'react';

// Box and Badge read the build flag when their module loads, so the flag is
// set before any component is required. require() keeps that order, because
// import statements are hoisted above it.
process.env.VITE_GV_DESIGN_TAGS = '1';

/* eslint-disable @typescript-eslint/no-var-requires */
const { render } = require('../../utils/testUtils/rtl');
const Badge = require('../Badge').default;
const CardButton = require('../CardButton').default;
const Quote = require('../Quote').default;

const Box = require('./index').default;
/* eslint-enable @typescript-eslint/no-var-requires */

const html = (el: unknown) => render(el).container.innerHTML;

describe('design tags on Box-rooted components, flag 1', () => {
  afterAll(() => {
    delete process.env.VITE_GV_DESIGN_TAGS;
  });

  it('tags a bare Box as Box', () => {
    expect(html(<Box />)).toContain('data-gv-component="Box"');
  });

  it('tags Badge as Badge, not Box', () => {
    const out = html(<Badge>new</Badge>);
    expect(out).toContain('data-gv-component="Badge"');
    expect(out).not.toContain('data-gv-component="Box"');
  });

  it('tags CardButton and Quote with their own name, not Box', () => {
    const card = html(<CardButton>x</CardButton>);
    expect(card).toContain('data-gv-component="CardButton"');
    expect(card).not.toContain('data-gv-component="Box"');
    expect(html(<Quote>x</Quote>)).toContain('data-gv-component="Quote"');
  });
});
