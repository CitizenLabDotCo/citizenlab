import { PageType } from '../typings';

const removeRequiredOtherFields = (
  requiredFields: string[],
  page: PageType | undefined,
  data: any
) => {
  if (!page) {
    return requiredFields;
  }

  const otherFieldValues = page.elements
    .filter((element) => element.options?.otherField)
    .map((element) => {
      const parentFieldKey = element.scope.split('/').pop();
      return { otherFieldKey: element.options?.otherField, parentFieldKey };
    });

  const filteredOut = page.elements.filter((element) => {
    const key = element.scope.split('/').pop();
    const field = otherFieldValues.find((item) => item.otherFieldKey === key);

    return (
      !field ||
      (field.parentFieldKey &&
        (Array.isArray(data[field.parentFieldKey])
          ? data[field.parentFieldKey].includes('other')
          : data[field.parentFieldKey] === 'other'))
    );
  });

  return requiredFields.filter((field) => {
    const key = field.split('/').pop();
    return filteredOut.find(
      (element) => element.scope.split('/').pop() === key
    );
  });
};

export default removeRequiredOtherFields;
