import { SerializedNodes } from '@craftjs/core';

import {
  defaultProjectPageLayout,
  BODY_NODE_ID,
  DESCRIPTION_NODE_ID,
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

// A project_page layout whose description section holds a text widget and a
// two-column widget with a nested image.
const projectPageLayout = (): SerializedNodes => {
  const layout = defaultProjectPageLayout();
  layout[DESCRIPTION_NODE_ID] = {
    ...layout[DESCRIPTION_NODE_ID],
    nodes: ['txt', 'cols'],
  };
  layout.txt = node('TextMultiloc', DESCRIPTION_NODE_ID);
  layout.cols = node('TwoColumn', DESCRIPTION_NODE_ID, ['col1']);
  layout.col1 = node('Container', 'cols', ['img']);
  layout.img = node('ImageMultiloc', 'col1');
  return layout;
};

describe('extractDescriptionEditorData', () => {
  it('re-roots the description section subtree as a standalone document', () => {
    const editorData = extractDescriptionEditorData(projectPageLayout());

    expect(editorData.ROOT.nodes).toEqual(['txt', 'cols']);
    expect(editorData.txt.parent).toBe('ROOT');
    expect(editorData.cols.parent).toBe('ROOT');
    // Nested nodes keep their internal structure.
    expect(editorData.col1.parent).toBe('cols');
    expect(editorData.img.parent).toBe('col1');
    // Nothing of the page structure leaks into the document.
    expect(editorData[DESCRIPTION_NODE_ID]).toBeUndefined();
    expect(editorData[BODY_NODE_ID]).toBeUndefined();
  });

  it('yields an empty document for an empty or absent section', () => {
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

  it('replaces the section subtree with the edited document', () => {
    const layout = projectPageLayout();
    const edited: SerializedNodes = {
      ROOT: node('div', '', ['newTxt']),
      newTxt: node('TextMultiloc', 'ROOT'),
    };

    const result = spliceDescriptionEditorData(layout, edited);

    expect(result[DESCRIPTION_NODE_ID].nodes).toEqual(['newTxt']);
    expect(result.newTxt.parent).toBe(DESCRIPTION_NODE_ID);
    // The previous subtree is gone, including nested nodes.
    expect(result.txt).toBeUndefined();
    expect(result.cols).toBeUndefined();
    expect(result.col1).toBeUndefined();
    expect(result.img).toBeUndefined();
    // The rest of the page is untouched.
    expect(result[BODY_NODE_ID]).toEqual(layout[BODY_NODE_ID]);
    expect(result.ROOT).toEqual(layout.ROOT);
  });

  it('empties the section when everything was deleted in the editor', () => {
    const result = spliceDescriptionEditorData(projectPageLayout(), {
      ROOT: node('div', '', []),
    });

    expect(result[DESCRIPTION_NODE_ID].nodes).toEqual([]);
    expect(result.txt).toBeUndefined();
  });
});
