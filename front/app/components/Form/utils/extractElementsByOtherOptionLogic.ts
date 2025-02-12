import { ExtendedUISchema, FormValues } from '../typings';

// This returns the elements on a page that are visible based on the data and the other option selection. You can pass returnHidden as true to get the hidden elements
const extractElementsByOtherOptionLogic = (
  page: any,
  data: FormValues
): ExtendedUISchema[] => {
  const otherFieldValues = page.elements
    .filter((element) => element.options?.otherField)
    .map((element) => {
      const parentFieldKey = element.scope?.split('/').pop();
      return { otherFieldKey: element.options?.otherField, parentFieldKey };
    });

  return page.elements.filter((element) => {
    const key = element.scope?.split('/').pop();
    const field = otherFieldValues.find((item) => item.otherFieldKey === key);

    return (
      !field ||
      (field.parentFieldKey &&
        (Array.isArray(data[field.parentFieldKey])
          ? data[field.parentFieldKey].includes('other')
          : data[field.parentFieldKey] === 'other'))
    );
  });
};

export default extractElementsByOtherOptionLogic;
