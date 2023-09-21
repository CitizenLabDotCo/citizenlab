import { IFlatCustomField } from 'services/formCustomFields';

type NumberHash = Record<string, number>;

export const getFieldNumbers = (formCustomFields: IFlatCustomField[]) => {
  const fieldNumbers: NumberHash = {};

  formCustomFields.forEach((field) => {
    if (field.input_type === 'section' || !field.enabled) return;
    fieldNumbers[field.id] = increment(fieldNumbers);
  });

  return fieldNumbers;
};

const increment = (obj: Record<string, any>) => Object.keys(obj).length + 1;
