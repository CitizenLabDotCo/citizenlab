import Quill from 'quill';

export const getHTML = (editor: Quill) => {
  return editor.root.innerHTML === '<p><br></p>' ? '' : editor.root.innerHTML;
};

export const setHTML = (editor: Quill, html: string = '') => {
  const delta = editor.clipboard.convert(html as any);
  editor.setContents(delta);
};

let savedPlaceholder = '';

export const syncPlaceHolder = (placeholder: string) => {
  savedPlaceholder = placeholder;
};

export const getPlaceHolder = () => savedPlaceholder;
