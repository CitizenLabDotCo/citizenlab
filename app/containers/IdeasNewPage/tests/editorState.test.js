// import React from 'react';
import { EditorState } from 'draft-js';
import { getEditorState } from '../editor/editorState';

// import SubmitIdeaForm from '../index';

describe('editorState', () => {
  it('when initial value was set, should return null', () => {
    const state = {
      editorState: EditorState.createEmpty(),
      initialStateSet: true,
    };
    // eslint-disable-next-line
    const fetchedContent = '<p><strong><ins>some text</ins></strong></p>';

    expect(getEditorState(fetchedContent, state.editorState, state.initialStateSet)).toBeNull();
  });
});
