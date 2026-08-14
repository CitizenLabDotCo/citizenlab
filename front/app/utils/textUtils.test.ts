import {
  capitalize,
  htmlToPlainText,
  stripHtml,
  withoutSpacing,
} from './textUtils';

describe('withoutSpacing', () => {
  it('removes spaces from simple string', () => {
    expect(withoutSpacing`hello world`).toEqual('helloworld');
  });

  it('removes spaces from template string with expressions', () => {
    const expectedResult =
      '<ul><li>with spaces 1</li><li>with spaces 2</li></ul>';

    expect(withoutSpacing`
    <ul>
      <li>${'with spaces 1'}</li>
      <li>${'with spaces 2'}</li>
    </ul>
  `).toEqual(expectedResult);
  });
});

describe('htmlToPlainText', () => {
  it('returns text without the surrounding markup', () => {
    expect(htmlToPlainText('<p>Hello <strong>world</strong></p>')).toEqual(
      'Hello world\n'
    );
  });

  it('breaks lines between block elements', () => {
    expect(htmlToPlainText('<p>One</p><p>Two</p>')).toEqual('One\nTwo\n');
    expect(htmlToPlainText('One<br />Two')).toEqual('One\nTwo');
  });

  it('drops script and event handler payloads', () => {
    expect(htmlToPlainText('Hi<script>alert(1)</script>')).toEqual('Hi');
    expect(htmlToPlainText('Hi<style>body { color: red }</style>')).toEqual(
      'Hi'
    );
    expect(htmlToPlainText('<img src=x onerror="alert(1)">')).toEqual('');
    expect(htmlToPlainText('<a href="javascript:alert(1)">Click</a>')).toEqual(
      'Click'
    );
  });

  it('keeps text that only looks like markup', () => {
    expect(htmlToPlainText('5 &lt; 6 &amp; 7 &gt; 6')).toEqual('5 < 6 & 7 > 6');
  });

  it('handles an empty string', () => {
    expect(htmlToPlainText('')).toEqual('');
  });
});

describe('stripHtml', () => {
  it('returns a single line of text', () => {
    expect(stripHtml('<p>One</p><p>Two</p>')).toEqual('One Two');
    expect(stripHtml('<ul><li>One</li><li>Two</li></ul>')).toEqual('One Two');
    expect(stripHtml('  <p>  Spaced   out  </p>  ')).toEqual('Spaced out');
  });

  it('drops script and event handler payloads', () => {
    expect(stripHtml('Hi<script>alert(1)</script>')).toEqual('Hi');
    expect(stripHtml('<img src=x onerror="alert(1)">')).toEqual('');
  });

  it('truncates to the given length', () => {
    expect(stripHtml('<p>One</p><p>Two</p>', 5)).toEqual('On...');
  });
});

describe('capitalize', () => {
  it('capitalizes strings correctly', () => {
    expect(capitalize(`hello world`)).toEqual('Hello world');
    expect(capitalize(`hello World`)).toEqual('Hello World');
    expect(capitalize(`HELLO WORLD`)).toEqual('HELLO WORLD');
    expect(capitalize('123')).toEqual('123');
    expect(capitalize('!@#')).toEqual('!@#');
    expect(capitalize('')).toEqual('');
    expect(capitalize('a')).toEqual('A');
  });
});
