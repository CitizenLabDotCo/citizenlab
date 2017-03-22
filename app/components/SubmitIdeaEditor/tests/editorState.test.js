// import React from 'react';
import { EditorState } from 'draft-js';
import { getEditorState } from '../editorState';

// import SubmitIdeaForm from '../index';

describe('editorState', () => {
  it('when initial value was set, should return null', () => {
    const state = {
      editorState: EditorState.createEmpty(),
      initialStateSet: true,
    };
    // eslint-disable-next-line
    const fetchedContent = {"entityMap":{},"blocks":[{"key":"f0anr","text":"test","type":"unstyled","depth":0,"inlineStyleRanges":[{"offset":0,"length":10,"style":"BOLD"}],"entityRanges":[],"data":{}}]};

    expect(getEditorState(fetchedContent, state.editorState, state.initialStateSet)).toBeNull();
  });
});
