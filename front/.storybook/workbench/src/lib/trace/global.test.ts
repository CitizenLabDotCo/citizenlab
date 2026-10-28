import { jsdomCanon, linkSheets, stubMatchMedia } from './fixture';
import { traceElement } from './index';
import { createIndexClient } from './indexClient';

const client = createIndexClient({
  base: 'i/',
  fetch: async (url) => {
    const v =
      url === 'i/meta.json'
        ? { version: 1, commit: 'abc', themeDefs: {}, constDefs: {} }
        : undefined;
    return { ok: v !== undefined, text: async () => JSON.stringify(v) };
  },
});

// What createGlobalStyle writes: a rule in styled-components' own sheet,
// scoped by no component's class.
it('reads a global style rule as global CSS, with its selector', async () => {
  stubMatchMedia(window);
  const style = document.createElement('style');
  style.setAttribute('data-styled', 'active');
  style.textContent = 'html, body, h1, h2, p { color: red; }';
  document.head.appendChild(style);
  const p = document.createElement('p');
  p.textContent = 'Hello';
  document.body.appendChild(p);
  linkSheets(document);
  const [t] = (
    await traceElement(window, p, ['color'], { canon: jsdomCanon, client })
  ).props;
  expect(t).toMatchObject({ prop: 'color', status: 'global' });
  expect(t.rule?.selector).toBe('html, body, h1, h2, p');
  expect(t.why).toBeUndefined();
});

// Icon draws its colour with fill={props.fill}: an SVG attribute, no CSS.
it('reads an SVG fill attribute as the attribute, not a browser default', async () => {
  stubMatchMedia(window);
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('fill', '#767676');
  svg.appendChild(path);
  document.body.appendChild(svg);
  linkSheets(document);
  const [t] = (
    await traceElement(window, path, ['fill'], { canon: jsdomCanon, client })
  ).props;
  expect(t).toMatchObject({
    prop: 'fill',
    status: 'attribute',
    attrOn: 'path',
  });
});
