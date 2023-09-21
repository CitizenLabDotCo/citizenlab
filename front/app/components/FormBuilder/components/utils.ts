import { IFlatCustomField } from 'services/formCustomFields';

type NumberHash = Record<string, number>;

export const getFieldNumbers = (formCustomFields: IFlatCustomField[]) => {
  const pageNumbers: NumberHash = {};
  const sectionNumbers: NumberHash = {};
  const questionNumbers: NumberHash = {};

  formCustomFields.forEach(({ id, input_type, enabled }) => {
    if (!enabled) return;

    if (input_type === 'page') {
      pageNumbers[id] = increment(pageNumbers);
    } else if (input_type === 'section') {
      sectionNumbers[id] = increment(sectionNumbers);
    } else {
      questionNumbers[id] = increment(questionNumbers);
    }
  });

  return { ...pageNumbers, ...sectionNumbers, ...questionNumbers };
};

const increment = (obj: Record<string, any>) => Object.keys(obj).length + 1;
