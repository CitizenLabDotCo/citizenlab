import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

export function getEditorStateFromHtmlString(html: string | null) {
  let editorState: EditorState;

  if (html !== null) {
    const blocksFromHtml = htmlToDraft(html);
    const { contentBlocks, entityMap } = blocksFromHtml;
    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
    editorState = EditorState.createWithContent(contentState);
  } else {
    editorState = EditorState.createEmpty();
  }

  return editorState;
}

export function getHtmlStringFromEditorState(editorState: EditorState): string {
  return (!editorState || editorState.isEmpty ? '' : draftToHtml(convertToRaw(editorState.getCurrentContent())));
}
