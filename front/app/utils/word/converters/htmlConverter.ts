import { htmlToPlainText } from 'utils/textUtils';
import {
  createEmptyParagraph,
  createParagraph,
} from 'utils/word/converters/textConverter';

const getTextLines = (text: string) =>
  text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

const convertHtmlToTextLines = (html: string) =>
  getTextLines(htmlToPlainText(html));

export const createParagraphsFromHtml = (html: string) => {
  const lines = convertHtmlToTextLines(html);

  if (lines.length === 0) {
    return [createEmptyParagraph()];
  }

  return lines.map((line) => createParagraph(line));
};
