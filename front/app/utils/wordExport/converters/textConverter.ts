import { Paragraph, TextRun, ExternalHyperlink, HeadingLevel } from 'docx';

import { TextSection } from '../types';

/**
 * Maps text variant to Word heading level.
 */
const HEADING_MAP: Record<
  string,
  (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined
> = {
  h1: HeadingLevel.HEADING_1,
  h2: HeadingLevel.HEADING_2,
  h3: HeadingLevel.HEADING_3,
  h4: HeadingLevel.HEADING_4,
  paragraph: undefined,
};

interface TextStyle {
  bold?: boolean;
  italics?: boolean;
  underline?: object;
  strike?: boolean;
}

/**
 * Converts a TextSection to Word paragraphs.
 * Parses HTML content (from Quill editor) and preserves formatting.
 */
export function convertText(section: TextSection): Paragraph[] {
  const heading = HEADING_MAP[section.variant || 'paragraph'];

  // If content is empty, return empty paragraph
  if (!section.content || section.content.trim() === '') {
    return [new Paragraph({ heading })];
  }

  // Parse HTML content and convert to Word runs
  const paragraphs = parseHtmlToParagraphs(section.content, heading);

  return paragraphs;
}

/**
 * Parses HTML content into Word paragraphs with text runs.
 * Handles block elements (p, div, br) as paragraph breaks.
 */
function parseHtmlToParagraphs(
  html: string,
  heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel]
): Paragraph[] {
  // Create a temporary DOM element to parse HTML
  const div = document.createElement('div');
  div.innerHTML = html;

  const paragraphs: Paragraph[] = [];
  let currentRuns: (TextRun | ExternalHyperlink)[] = [];

  function flushParagraph() {
    if (currentRuns.length > 0) {
      paragraphs.push(
        new Paragraph({
          heading: paragraphs.length === 0 ? heading : undefined,
          children: currentRuns,
        })
      );
      currentRuns = [];
    }
  }

  function processNode(node: Node, inheritedStyle: TextStyle = {}) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (text) {
        currentRuns.push(
          new TextRun({
            text,
            bold: inheritedStyle.bold,
            italics: inheritedStyle.italics,
            underline: inheritedStyle.underline,
            strike: inheritedStyle.strike,
          })
        );
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const tagName = el.tagName.toUpperCase();

      // Check if this is a block element that should create a new paragraph
      if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(tagName)) {
        flushParagraph();
      }

      // Handle line breaks
      if (tagName === 'BR') {
        flushParagraph();
        return;
      }

      // Build style for this element
      const style: TextStyle = { ...inheritedStyle };

      if (tagName === 'STRONG' || tagName === 'B') {
        style.bold = true;
      }
      if (tagName === 'EM' || tagName === 'I') {
        style.italics = true;
      }
      if (tagName === 'U') {
        style.underline = {};
      }
      if (tagName === 'S' || tagName === 'STRIKE' || tagName === 'DEL') {
        style.strike = true;
      }

      // Handle links
      if (tagName === 'A') {
        const href = el.getAttribute('href') || '';
        const linkText = el.textContent || '';

        if (href && linkText) {
          currentRuns.push(
            new ExternalHyperlink({
              children: [
                new TextRun({
                  text: linkText,
                  bold: style.bold,
                  italics: style.italics,
                  underline: style.underline || {},
                  style: 'Hyperlink',
                }),
              ],
              link: href,
            })
          );
        }
        return; // Don't process children of links
      }

      // Handle lists
      if (tagName === 'UL' || tagName === 'OL') {
        flushParagraph();
        const listItems = el.querySelectorAll(':scope > li');
        listItems.forEach((li, index) => {
          const bullet = tagName === 'UL' ? '\u2022 ' : `${index + 1}. `;
          currentRuns.push(new TextRun({ text: bullet }));
          li.childNodes.forEach((child) => processNode(child, style));
          flushParagraph();
        });
        return;
      }

      // Process children
      node.childNodes.forEach((child) => processNode(child, style));

      // After block elements, flush paragraph
      if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(tagName)) {
        flushParagraph();
      }
    }
  }

  // Process all nodes
  div.childNodes.forEach((node) => processNode(node));
  flushParagraph();

  // If no paragraphs were created, create one with the plain text
  if (paragraphs.length === 0) {
    paragraphs.push(
      new Paragraph({
        heading,
        children: [new TextRun({ text: div.textContent || '' })],
      })
    );
  }

  return paragraphs;
}

/**
 * Converts plain text (non-HTML) to a simple paragraph.
 */
export function convertPlainText(
  text: string,
  variant?: TextSection['variant']
): Paragraph {
  return new Paragraph({
    heading: HEADING_MAP[variant || 'paragraph'],
    children: [new TextRun({ text })],
  });
}
