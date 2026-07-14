import { SerializedNodes } from '@craftjs/core';

import {
  defaultProjectPageLayout,
  BODY_NODE_ID,
  PHASES_NODE_ID,
  EVENTS_NODE_ID,
} from './defaultLayout';
import {
  extractDescriptionEditorData,
  spliceDescriptionEditorData,
} from './descriptionSection';

const node = (
  name: string,
  parent: string,
  children: string[] = []
): SerializedNodes[string] =>
  ({
    type: { resolvedName: name },
    nodes: children,
    props: {},
    custom: {},
    hidden: false,
    parent,
    isCanvas: false,
    displayName: name,
    linkedNodes: {},
  } as unknown as SerializedNodes[string]);

const projectPageLayout = (): SerializedNodes => {
  const layout = defaultProjectPageLayout();
  layout[BODY_NODE_ID] = {
    ...layout[BODY_NODE_ID],
    nodes: ['txt', 'cols', PHASES_NODE_ID, EVENTS_NODE_ID],
  };
  layout.txt = node('TextMultiloc', BODY_NODE_ID);
  layout.cols = node('TwoColumn', BODY_NODE_ID, ['col1']);
  layout.col1 = node('Container', 'cols', ['img']);
  layout.img = node('ImageMultiloc', 'col1');
  return layout;
};

describe('extractDescriptionEditorData', () => {
  it('re-roots the description content as a standalone document, excluding project widgets', () => {
    const editorData = extractDescriptionEditorData(projectPageLayout());

    expect(editorData.ROOT.nodes).toEqual(['txt', 'cols']);
    expect(editorData.txt.parent).toBe('ROOT');
    expect(editorData.cols.parent).toBe('ROOT');
    expect(editorData.col1.parent).toBe('cols');
    expect(editorData.img.parent).toBe('col1');
    expect(editorData[BODY_NODE_ID]).toBeUndefined();
    expect(editorData[PHASES_NODE_ID]).toBeUndefined();
    expect(editorData[EVENTS_NODE_ID]).toBeUndefined();
  });

  it('collects content in body order, even interleaved with project widgets', () => {
    const layout = projectPageLayout();
    layout[BODY_NODE_ID] = {
      ...layout[BODY_NODE_ID],
      nodes: [PHASES_NODE_ID, 'txt', EVENTS_NODE_ID, 'cols'],
    };

    expect(extractDescriptionEditorData(layout).ROOT.nodes).toEqual([
      'txt',
      'cols',
    ]);
  });

  it('yields an empty document for a body without content', () => {
    expect(
      extractDescriptionEditorData(defaultProjectPageLayout()).ROOT.nodes
    ).toEqual([]);
    expect(extractDescriptionEditorData({}).ROOT.nodes).toEqual([]);
  });
});

describe('spliceDescriptionEditorData', () => {
  it('is the inverse of extract (unchanged edits round-trip)', () => {
    const layout = projectPageLayout();

    const roundTripped = spliceDescriptionEditorData(
      layout,
      extractDescriptionEditorData(layout)
    );

    expect(roundTripped).toEqual(layout);
  });

  it('replaces the content subtrees with the edited document, in place', () => {
    const layout = projectPageLayout();
    const edited: SerializedNodes = {
      ROOT: node('div', '', ['newTxt']),
      newTxt: node('TextMultiloc', 'ROOT'),
    };

    const result = spliceDescriptionEditorData(layout, edited);

    expect(result[BODY_NODE_ID].nodes).toEqual([
      'newTxt',
      PHASES_NODE_ID,
      EVENTS_NODE_ID,
    ]);
    expect(result.newTxt.parent).toBe(BODY_NODE_ID);
    expect(result.txt).toBeUndefined();
    expect(result.cols).toBeUndefined();
    expect(result.col1).toBeUndefined();
    expect(result.img).toBeUndefined();
    expect(result[PHASES_NODE_ID]).toEqual(layout[PHASES_NODE_ID]);
    expect(result.ROOT).toEqual(layout.ROOT);
  });

  it('inserts before the project widgets when there was no content', () => {
    const edited: SerializedNodes = {
      ROOT: node('div', '', ['newTxt']),
      newTxt: node('TextMultiloc', 'ROOT'),
    };

    const result = spliceDescriptionEditorData(
      defaultProjectPageLayout(),
      edited
    );

    expect(result[BODY_NODE_ID].nodes).toEqual([
      'newTxt',
      PHASES_NODE_ID,
      EVENTS_NODE_ID,
    ]);
  });

  it('keeps project widgets when content was interleaved around them', () => {
    const layout = projectPageLayout();
    layout[BODY_NODE_ID] = {
      ...layout[BODY_NODE_ID],
      nodes: ['txt', PHASES_NODE_ID, 'cols', EVENTS_NODE_ID],
    };
    const edited: SerializedNodes = {
      ROOT: node('div', '', ['newTxt']),
      newTxt: node('TextMultiloc', 'ROOT'),
    };

    const result = spliceDescriptionEditorData(layout, edited);

    expect(result[BODY_NODE_ID].nodes).toEqual([
      'newTxt',
      PHASES_NODE_ID,
      EVENTS_NODE_ID,
    ]);
  });

  it('empties the content when everything was deleted in the editor', () => {
    const result = spliceDescriptionEditorData(projectPageLayout(), {
      ROOT: node('div', '', []),
    });

    expect(result[BODY_NODE_ID].nodes).toEqual([
      PHASES_NODE_ID,
      EVENTS_NODE_ID,
    ]);
    expect(result.txt).toBeUndefined();
  });
});
