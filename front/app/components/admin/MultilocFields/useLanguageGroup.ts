import { useContext, useEffect, useRef, useState } from 'react';

import { MessageDescriptor } from 'react-intl';
import { Multiloc, SupportedLocale } from 'typings';

import { appLocalePairs } from 'containers/App/constants';

import { useIntl } from 'utils/cl-intl';

import LanguageButtonContext from './LanguageButtonContext';
import LanguageChecksContext from './LanguageChecksContext';
import messages from './messages';
import RevealGroupContext from './RevealGroupContext';
import useSelectedLocale from './useSelectedLocale';

export type GroupField = {
  value: Multiloc | null | undefined;
  // Names the field in the error line, e.g. "title".
  name: string;
  required?: boolean;
};

// Rich text keeps its markup when emptied, e.g. "<p><br></p>".
export const hasText = (text: string | undefined) =>
  !!text &&
  (text.replace(/<[^>]*>/g, '').trim().length > 0 ||
    /<(img|iframe)/.test(text));

// The fields one language picker drives. In the new back office, saving with a
// language still to translate doesn't save: the group opens that language and
// names what is missing in one line under the fields.
const useLanguageGroup = (
  fields: GroupField[],
  // For a modal that runs check itself, so it stays out of the form behind it.
  { ownCheck = false }: { ownCheck?: boolean } = {}
) => {
  const { formatMessage, formatList } = useIntl();
  const redesigned = useContext(LanguageButtonContext);
  const formChecks = useContext(LanguageChecksContext);
  const checks = ownCheck ? null : formChecks;
  const reveal = useContext(RevealGroupContext);
  const { locales, selectedLocale, setSelectedLocale } = useSelectedLocale();
  const [checked, setChecked] = useState(false);

  const active = redesigned && locales.length > 1;
  const filled = (field: GroupField, locale: SupportedLocale) =>
    hasText(field.value?.[locale] ?? undefined);
  // Left to translate: a required field, or one written in another language.
  const isMissing = (field: GroupField, locale: SupportedLocale) =>
    !filled(field, locale) &&
    (!!field.required || locales.some((other) => filled(field, other)));
  const missingLocales = locales.filter((locale) =>
    fields.some((field) => isMissing(field, locale))
  );
  const anyText = fields.some((field) =>
    locales.some((locale) => filled(field, locale))
  );
  // A required field empty in every language gets the form's own error.
  const requiredEmpty = fields.some(
    (field) =>
      field.required && !locales.some((locale) => filled(field, locale))
  );

  const check = () => {
    const passes = !active || requiredEmpty || missingLocales.length === 0;
    setChecked(!passes);
    if (passes) return true;

    // Stays on the language on screen while it is incomplete.
    if (!selectedLocale || !missingLocales.includes(selectedLocale)) {
      setSelectedLocale(missingLocales[0]);
    }
    reveal?.();
    return false;
  };

  const latestCheck = useRef(check);
  useEffect(() => {
    latestCheck.current = check;
  });
  useEffect(() => checks?.register(() => latestCheck.current()), [checks]);

  const shownLocale =
    selectedLocale && missingLocales.includes(selectedLocale)
      ? selectedLocale
      : missingLocales[0];
  const missingNames = fields
    .filter((field) =>
      missingLocales.some((locale) => isMissing(field, locale))
    )
    .map((field) => field.name);

  const error =
    checked && active && !requiredEmpty && missingLocales.length > 0
      ? formatMessage(messages.missingLanguages, {
          fields: formatList(missingNames, { type: 'conjunction' }),
          language: appLocalePairs[shownLocale],
          others: missingLocales.length - 1,
        })
      : undefined;

  return {
    locales,
    selectedLocale,
    setSelectedLocale,
    // A language is done once nothing is left to translate.
    languages: locales.map((locale) => ({
      id: locale,
      name: appLocalePairs[locale],
      done: !missingLocales.includes(locale),
    })),
    hasText: anyText,
    // For the segmented switcher outside the new back office.
    translations: Object.fromEntries(
      locales.map((locale) => [
        locale,
        missingLocales.includes(locale) ? '' : 'done',
      ])
    ),
    // Names the language being edited, where the language picker shows.
    placeholder: (inLanguage: MessageDescriptor, plain: MessageDescriptor) =>
      active && selectedLocale
        ? formatMessage(inLanguage, {
            language: appLocalePairs[selectedLocale],
          })
        : formatMessage(plain),
    error,
    check,
  };
};

export type LanguageGroupState = ReturnType<typeof useLanguageGroup>;

export default useLanguageGroup;
