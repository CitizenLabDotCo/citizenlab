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
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const text = doc.body.innerText || '';
  return getTextLines(text);
};

export const createParagraphsFromHtml = (html: string) => {
  const lines = convertHtmlToTextLines(html);

  if (lines.length === 0) {
    return [createEmptyParagraph()];
  }

  return lines.map((line) => createParagraph(line));
};
