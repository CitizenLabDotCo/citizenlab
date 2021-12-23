import { Multiloc, Locale } from 'typings';
import { isEmpty, some } from 'lodash-es';
import { validateSlug as validateSlugRegex } from 'utils/textUtils';

const filterMultiloc = (multiloc: Multiloc, localesToKeep: Locale[]) => {
  return Object.fromEntries(
    Object.entries(multiloc).filter(([locale]) =>
      localesToKeep.includes(locale as Locale)
    )
  );
};

const multilocValuesMissing = (multiloc: Multiloc) => {
  return isEmpty(multiloc) || some(multiloc, isEmpty);
};

export const validateMultiloc = (
  multiloc: Multiloc,
  localesToKeep: Locale[]
) => {
  const filteredMultiloc = filterMultiloc(multiloc, localesToKeep);

  if (multilocValuesMissing(filteredMultiloc)) {
    return [{ error: 'blank' }] as any;
  }

  return;
};

export const validateSlug = (
  slug: string | undefined,
  existingSlugs?: Set<string>,
  currentSlug?: string
) => {
  if (slug === undefined) return;

  if (slug.length === 0) {
    return 'empty_slug';
  }

  if (!validateSlugRegex(slug)) {
    return 'invalid_slug';
  }

  if (existingSlugs && existingSlugs.has(slug) && slug !== currentSlug) {
    return 'taken_slug';
  }

  return;
};

export const removeUndefined = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).reduce((acc, [key, value]) => {
      return value === undefined ? acc : [...acc, [key, value]];
    }, [])
  );
};
