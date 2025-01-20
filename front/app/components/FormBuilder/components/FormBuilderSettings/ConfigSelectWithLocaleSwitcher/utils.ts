import { SupportedLocale } from 'typings';

import { IOptionsType } from 'api/custom_fields/types';

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

// interface UpdateFormOnMultilinePasteParams {
//   update: (index: number, newOption: IOptionsType) => void;
//   locale: SupportedLocale;
//   lines: string[];
//   index: number;
//   options: IOptionsType[];
// }

// export const updateFormOnMultlinePaste = ({
//   update,
//   locale,
//   lines,
//   index,
//   options
// }: UpdateFormOnMultilinePasteParams) => {

// }
