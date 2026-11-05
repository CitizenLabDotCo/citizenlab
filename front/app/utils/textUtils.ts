import { truncate } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

export { truncate };

export function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const truncateMultiloc = (
  multiloc: Multiloc,
  length?: number
): Multiloc => {
  return Object.entries(multiloc).reduce((acc, [key, value]) => {
    acc[key] = truncate(value, length);
    return acc;
  }, {});
};

const blockBoundaryRegEx = /<\/(p|div|li|h[1-6]|tr|blockquote)>|<br\s*\/?>/gi;

// Converts HTML to plain text, preserving line breaks. DOMParser is inert (no
// scripts run, no event handlers fire), unlike `innerHTML`, so this is XSS-safe.
export function htmlToPlainText(html: string) {
  const withLineBreaks = html.replace(blockBoundaryRegEx, '\n');
  const { body } = new DOMParser().parseFromString(withLineBreaks, 'text/html');
  // Otherwise their source code would show up as text.
  body.querySelectorAll('script, style').forEach((element) => element.remove());

  return body.textContent;
}

// Single line of plain text, for meta tags and previews.
export function stripHtml(html: string, maxLength?: number) {
  const text = htmlToPlainText(html).replace(/\s+/g, ' ').trim();

  return truncate(text, maxLength);
}

// Default slug rules including arabic character ranges
export const slugRegEx = RegExp(
  /^[a-z0-9\u0600-\u06FF\u0750-\u077F]+(?:-[a-z0-9\u0600-\u06FF\u0750-\u077F]+)*$/
);

export function validateSlug(slug: string) {
  return slugRegEx.test(slug);
}

interface IFullNameableUser {
  attributes: {
    first_name?: string | null;
    last_name?: string | null;
    [x: string]: any;
    [x: number]: any;
  };
  [x: string]: any;
  [x: number]: any;
}

export function getFullName(user: IFullNameableUser) {
  return `${user.attributes.first_name} ${user.attributes.last_name}`;
}

const removeSpace = (str: string) => str.replace(/\s/g, '');

// For use with template strings. E.g.
// withoutSpacing`<ul>  \n  <li>${'text with spaces'}    </li> \n   </ul>`
// => '<ul><li>text with spaces</li></ul>'
// See corresponding test
export function withoutSpacing(
  strings: TemplateStringsArray,
  ...expressions: string[]
) {
  if (strings.length === 1) return removeSpace(strings[0]);

  return strings.reduce((acc, str, i) => {
    let newAcc = acc + removeSpace(str);

    if (i < expressions.length) {
      newAcc += expressions[i];
    }

    return newAcc;
  }, '');
}
