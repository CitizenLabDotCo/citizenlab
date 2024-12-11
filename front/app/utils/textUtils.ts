import { Multiloc } from 'typings';

export function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function truncate(str: string, length?: number) {
  if (typeof length === 'number' && str.length > length) {
    return `${str.substring(0, length - 3)}...`;
  }
  return str;
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

export function stripHtml(html: string, maxLength?: number) {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  const result = tmp.textContent || tmp.innerText || '';

  return truncate(result, maxLength);
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
