import { EditorState, ContentState, convertFromHTML } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';

export function getEditorStateFromHtmlString(html: string | null | undefined) {
  let editorState = EditorState.createEmpty();

  if (html) {
    const blocksFromHTML = convertFromHTML(html);
    const contentState = ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap);
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
