import { EditorState, ContentState } from 'draft-js';
import htmlToDraft from 'html-to-draftjs';

export function getEditorState(content, editorState, initialStateSet) {
  // console.log(htmlToDraft(content));
  if (content) {
    const contentDraft = htmlToDraft(content);

    const contentBlocks = contentDraft.contentBlocks;
    return (editorState && !initialStateSet
            ? EditorState.createWithContent(ContentState.createFromBlockArray(contentBlocks))
            : null);
  }

  return null;
}
