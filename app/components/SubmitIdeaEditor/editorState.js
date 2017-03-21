import { EditorState, convertFromRaw } from 'draft-js';

export function getEditorState(content, editorState, initialStateSet) {
  return (content && editorState && !initialStateSet
          ? EditorState.createWithContent(convertFromRaw(content))
          : null);
}
