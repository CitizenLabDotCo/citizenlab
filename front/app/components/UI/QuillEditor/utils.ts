import Quill from 'quill';

/**
 * Gets plain text length from a LIVE Quill instance.
 * This should only be used within the QuillEditor component.
 */
export const getQuillPlainTextLength = (editor: Quill): number => {
  // Quill's native getText() is the most reliable source of truth.
  // The -1 accounts for the trailing newline character Quill always adds.
  return Math.max(0, editor.getText().length - 1);
};

/**
 * Gets plain text length from an HTML STRING by intelligently mimicking
 * Quill's own `getText()` behavior in a way that is safe for both
 * real browsers and the JSDOM test environment.
 */
export const getPlainTextLengthFromHTML = (
  html: string | null | undefined
): number => {
  if (!html || html === '<p><br></p>') return 0;

  // Create a DOM element to parse the HTML.
  const tempDiv = document.createElement('div');
  // We use innerHTML to parse the string, but do not insert it into the document.
  tempDiv.innerHTML = html;

  // Remove script and style tags completely so their content is not counted.
  // This is the correct, secure behavior.
  tempDiv.querySelectorAll('script, style').forEach((el) => el.remove());

  // This is necessary because `innerText` is unreliable in JSDOM.
  // Replace <br> tags with a newline character.
  tempDiv.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));

  // Append a newline character to all block-level elements. This simulates
  // the line break that appears after these elements when rendered.
  const blockElements = tempDiv.querySelectorAll(
    'p, h1, h2, h3, h4, h5, h6, li, blockquote, div, pre'
  );
  blockElements.forEach((el) => {
    el.appendChild(document.createTextNode('\n'));
  });

  let text = tempDiv.textContent || '';

  // If the result after all processing is just whitespace, the length is 0.
  if (text.trim() === '') {
    return 0;
  }

  // Quill's getText() produces a single trailing newline. Our process might create
  // more. We'll clean up all trailing whitespace and add a single newline back.
  // This standardizes the string to match Quill's format.
  text = `${text.trimEnd()}\n`;

  // we can apply the exact same logic as the live counter to get the final length.
  return Math.max(0, text.length - 1);
};

export const getHTML = (editor: Quill) => {
  return editor.root.innerHTML === '<p><br></p>' ? '' : editor.root.innerHTML;
};

export const setHTML = (editor: Quill, html: string = '') => {
  const delta = editor.clipboard.convert({ html });
  editor.setContents(delta);
};
