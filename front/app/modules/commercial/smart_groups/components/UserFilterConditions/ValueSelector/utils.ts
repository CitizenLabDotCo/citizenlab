import { Multiloc, IOption } from 'typings';

import { Localize } from 'hooks/useLocalize';

type DataObject = {
  id: string;
  attributes: {
    title_multiloc: Multiloc;
  };
};

export const generateOptions = (
  localize: Localize,
  data?: DataObject[]
): IOption[] => {
  if (data) {
    return data.map((dataObject) => {
      return {
        value: dataObject.id,
        label: localize(dataObject.attributes.title_multiloc),
      };
    });
  }
  return [];
};
