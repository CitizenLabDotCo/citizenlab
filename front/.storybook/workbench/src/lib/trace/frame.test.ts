import { jsdomCanon, stubMatchMedia } from './fixture';
import { traceElement } from './index';
import { createIndexClient } from './indexClient';
import type { IndexStyles, Loc } from './types';

/* eslint-disable @typescript-eslint/no-var-requires */
const React = require('react');
const { render } = require('@testing-library/react');
/* eslint-enable @typescript-eslint/no-var-requires */

const STORY =
  'app/containers/Admin/projects/project/backofficeRedesign/Event/SetupCard.stories.tsx';
const at = (line: number): Loc => ({
  start: 0,
  end: 1,
  line,
  col: 6,
  endLine: line,
  endCol: 9,
});

// SetupCard's decorator: `<div style={{ width: 560, padding: 18, background: 'white' }}>`
const frameStyle = (file: string, line: number): IndexStyles[number] => ({
  file,
  loc: at(line),
  entries: {
    width: { value: 560, loc: at(line) },
    padding: { value: 18, loc: at(line) },
    background: { value: 'white', loc: at(line) },
  },
});

const clientWith = (styles: IndexStyles) =>
  createIndexClient({
    base: 'i/',
    fetch: async (url) => {
      const v =
        url === 'i/meta.json'
          ? { version: 1, commit: 'abc', themeDefs: {}, constDefs: {} }
          : url === 'i/styles.json'
          ? styles
          : undefined;
      return { ok: v !== undefined, text: async () => JSON.stringify(v) };
    },
  });

const frameDiv = () => {
  stubMatchMedia(window);
  const { container } = render(
    React.createElement('div', {
      style: { width: 560, padding: 18, background: 'white' },
    })
  );
  return container.firstChild as HTMLElement;
};

describe('an inline style from a story frame', () => {
  it('joins the one indexed object with the same entries', async () => {
    const el = frameDiv();
    const trace = await traceElement(window, el, ['padding-top'], {
      canon: jsdomCanon,
      client: clientWith([
        frameStyle('app/x/Card.tsx', 5),
        { file: STORY, loc: at(40) },
        frameStyle(STORY, 32),
      ]),
    });
    expect(trace.props[0]).toEqual({
      prop: 'padding-top',
      value: expect.any(String),
      status: 'inline',
      decl: { template: 'style', file: STORY, line: 32, storyFrame: true },
    });
  });

  it('says ambiguous when two story objects match, and has no decl', async () => {
    const el = frameDiv();
    const trace = await traceElement(window, el, ['padding-top'], {
      canon: jsdomCanon,
      client: clientWith([
        frameStyle(STORY, 32),
        frameStyle('.storybook/preview.tsx', 9),
      ]),
    });
    expect(trace.props[0]).toMatchObject({
      status: 'inline',
      why: 'ambiguous',
    });
    expect(trace.props[0].decl).toBeUndefined();
  });

  it("takes the story's own file among equal objects of several stories", async () => {
    const el = frameDiv();
    const other = STORY.replace('SetupCard', 'ImageCard');
    const client = clientWith([frameStyle(other, 33), frameStyle(STORY, 32)]);
    const trace = await traceElement(window, el, ['padding-top'], {
      canon: jsdomCanon,
      client,
      storyFile: STORY,
    });
    expect(trace.props[0].decl).toEqual({
      template: 'style',
      file: STORY,
      line: 32,
      storyFrame: true,
    });
    const elsewhere = await traceElement(window, el, ['padding-top'], {
      canon: jsdomCanon,
      client,
      storyFile: 'app/x/Other.stories.tsx',
    });
    expect(elsewhere.props[0]).toMatchObject({ why: 'ambiguous' });
  });

  it('is the edit when the workbench painted it', async () => {
    const el = frameDiv();
    const trace = await traceElement(window, el, ['padding-top'], {
      canon: jsdomCanon,
      painted: () => true,
      client: clientWith([frameStyle(STORY, 32)]),
    });
    expect(trace.props[0]).toMatchObject({ status: 'edit' });
  });
});
