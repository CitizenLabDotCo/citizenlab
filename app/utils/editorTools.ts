import { EditorState, ContentState, convertFromHTML } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import { isString, isEmpty } from 'lodash';

export function getEditorStateFromHtmlString(html: string | null | undefined) {
  let editorState = EditorState.createEmpty();

  if (isString(html) && !isEmpty(html) && html !== '<p></p>') {
    const { contentBlocks, entityMap } = convertFromHTML(html);
    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
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
