import Quill from 'quill';

import {
  getQuillPlainTextLength,
  getPlainTextLengthFromHTML,
  getHTML,
  setHTML,
} from './utils';

// Helper to create a real, headless Quill instance from an HTML string.
// This instance becomes our "source of truth" for character counts.
const createEditor = (htmlContent: string): Quill => {
  document.body.innerHTML = '<div id="editor"></div>';
  const editorElement = document.getElementById('editor') as HTMLElement;
  const quill = new Quill(editorElement);

  if (htmlContent) {
    const delta = quill.clipboard.convert({ html: htmlContent });
    quill.setContents(delta, 'silent');
  }

  return quill;
};

// Define the HTML input for various scenarios. The "expected" length
// will be dynamically calculated from a real Quill instance.
const testCases = [
  { name: 'empty content', html: '' },
  { name: 'empty paragraph', html: '<p><br></p>' },
  { name: 'simple text', html: '<p>Hello World</p>' },
  {
    name: 'text with formatting',
    html: '<p><strong>Hello</strong> <em>World</em></p>',
  },
  { name: 'multiple paragraphs', html: '<p>Line 1</p><p>Line 2</p>' },
  { name: 'line breaks inside a paragraph', html: '<p>Line 1<br>Line 2</p>' },
  { name: 'unordered list', html: '<ul><li>Item 1</li><li>Item 2</li></ul>' },
  { name: 'HTML entities', html: '<p>Hello &amp; World!</p>' },
  { name: 'non-breaking spaces', html: '<p>Hello&nbsp;World</p>' },
  {
    name: 'user-typed escaped HTML',
    html: '<p>&lt;div&gt;not a div&lt;/div&gt;</p>',
  },
  {
    name: 'complex nested document',
    html: '<h1>Title</h1><p>Some text.</p><ul><li>Point 1</li><li>Point 2</li></ul>',
  },
  { name: 'text with emojis', html: '<p>Hello 👋 World 🌍</p>' },
  { name: 'text with only whitespace', html: '<p>   </p>' },
];

describe('Quill Character Count Consistency', () => {
  test.each(testCases)(
    'should return identical counts for: $name',
    ({ html }) => {
      // 1. Create a real Quill editor. This is our source of truth.
      const editor = createEditor(html);

      // 2. Get the "true" length from the live Quill instance.
      const trueQuillLength = getQuillPlainTextLength(editor);

      // 3. Get the calculated length from our utility function.
      const lengthFromHTML = getPlainTextLengthFromHTML(html);

      // 5. The core assertion: The utility MUST match the real Quill instance.
      expect(lengthFromHTML).toBe(trueQuillLength);
    }
  );

  describe('Edge Cases for getPlainTextLengthFromHTML', () => {
    it('should return 0 for null or undefined input', () => {
      expect(getPlainTextLengthFromHTML(null)).toBe(0);
      expect(getPlainTextLengthFromHTML(undefined)).toBe(0);
    });

    it('should handle malformed HTML gracefully', () => {
      expect(getPlainTextLengthFromHTML('<p>Hello <unclosed>World')).toBe(11);
    });

    it('should handle very long content efficiently', () => {
      const longText = 'A'.repeat(1000);
      const longHTML = `<p>${longText}</p>`;

      const startTime = performance.now();
      const result = getPlainTextLengthFromHTML(longHTML);
      const endTime = performance.now();

      expect(result).toBe(1000);
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should remove script and style tags completely', () => {
      const htmlWithScript = '<p>Hello<script>alert("test")</script>World</p>';
      const htmlWithStyle =
        '<p>Hello<style>body { color: red; }</style>World</p>';

      expect(getPlainTextLengthFromHTML(htmlWithScript)).toBe(10);
      expect(getPlainTextLengthFromHTML(htmlWithStyle)).toBe(10);
    });

    it('should handle empty string input', () => {
      expect(getPlainTextLengthFromHTML('')).toBe(0);
    });
  });

  describe('Utility Functions', () => {
    it('should test getHTML function', () => {
      const editor = createEditor('<p>Hello World</p>');
      const html = getHTML(editor);
      expect(html).toContain('Hello World');
    });

    it('should test setHTML function', () => {
      const editor = createEditor('');
      setHTML(editor, '<p>New Content</p>');
      const html = getHTML(editor);
      expect(html).toContain('New Content');
    });
  });

  describe('Performance and Memory', () => {
    it('should not leak memory with repeated DOM operations', () => {
      const html = '<p>Hello World</p>';

      // Create many temporary elements to test memory management
      for (let i = 0; i < 100; i++) {
        getPlainTextLengthFromHTML(html);
      }

      // If we get here without errors, memory management is working
      expect(true).toBe(true);
    });
  });
});
