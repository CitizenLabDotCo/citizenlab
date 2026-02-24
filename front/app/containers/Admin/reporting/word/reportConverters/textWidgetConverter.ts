import {
  createEmptyParagraph,
  createParagraph,
} from 'utils/word/converters/textConverter';

const getTextLines = (text: string) =>
  text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

export const convertHtmlToTextLines = (html: string) => {
  const withLineBreaks = html
    .replace(/<\/(h[1-6]|p|div|li|tr|blockquote)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n');

  const parser = new DOMParser();
  const doc = parser.parseFromString(withLineBreaks, 'text/html');
  const text = doc.body.textContent || '';
  return getTextLines(text);
};

export const createParagraphsFromHtml = (html: string) => {
  const lines = convertHtmlToTextLines(html);

  if (lines.length === 0) {
    return [createEmptyParagraph()];
  }

  return lines.map((line) => createParagraph(line));
};
