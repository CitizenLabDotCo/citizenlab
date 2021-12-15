import { Multiloc, Locale } from 'typings';
import { isEmpty, some } from 'lodash-es';

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
