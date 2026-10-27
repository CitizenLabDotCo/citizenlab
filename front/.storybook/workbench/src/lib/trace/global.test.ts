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
