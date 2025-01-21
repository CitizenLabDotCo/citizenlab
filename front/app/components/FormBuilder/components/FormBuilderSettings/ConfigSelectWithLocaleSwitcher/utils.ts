import { SupportedLocale } from 'typings';

import { IOptionsType } from 'api/custom_fields/types';

import { generateTempId } from 'components/FormBuilder/utils';

interface AllowMultilinePasteParams {
  options: IOptionsType[];
  index: number;
  locale: SupportedLocale;
}

// Ensure that for the given locale,
// the option at the given index and all
// subsequent indices are empty
export const allowMultilinePaste = ({
  options,
  index,
  locale,
}: AllowMultilinePasteParams) => {
  for (let i = index; i < options.length; i++) {
    if (options[i].title_multiloc[locale]) {
      return false;
    }
  }

  return true;
};

interface UpdateFormOnMultilinePasteParams {
  update: (index: number, newOption: IOptionsType) => void;
  append: (newOption: IOptionsType) => void;
  locale: SupportedLocale;
  lines: string[];
  index: number;
  options: IOptionsType[];
}

export const updateFormOnMultlinePaste = ({
  update,
  append,
  locale,
  lines,
  index,
  options,
}: UpdateFormOnMultilinePasteParams) => {
  lines.forEach((line, i) => {
    const optionIndex = index + i;
    const option =
      optionIndex >= options.length ? undefined : options[optionIndex];

    if (option) {
      update(optionIndex, {
        ...option,
        title_multiloc: {
          ...option.title_multiloc,
          [locale]: sanitizeLine(line),
        },
        ...(!option.id && !option.temp_id ? { temp_id: generateTempId() } : {}),
      });
    } else {
      append({
        title_multiloc: {
          [locale]: sanitizeLine(line),
        },
        temp_id: generateTempId(),
      });
    }
  });
};

const sanitizeLine = (line: string) => {
  const trimmedLine = line.trim();
  const cleanedLine = trimmedLine.startsWith('-')
    ? trimmedLine.slice(1)
    : trimmedLine;
  return cleanedLine.trim();
};
