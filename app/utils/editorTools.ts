import { EditorState } from 'draft-js';
import { stateFromHTML } from 'draft-js-import-html';
import { stateToHTML } from 'draft-js-export-html';
import { isString, isEmpty } from 'lodash';

export function getEditorStateFromHtmlString(html: string | null | undefined) {
  let editorState = EditorState.createEmpty();

  if (isString(html) && !isEmpty(html) && html !== '<p></p>') {
    const contentState = stateFromHTML(html);
    editorState = EditorState.createWithContent(contentState);
  }

  return editorState;
}

export function getHtmlStringFromEditorState(editorState: EditorState | null | undefined) {
  let html = '';

  if (editorState) {
    html = stateToHTML(editorState.getCurrentContent());
  }

  return html;
}
