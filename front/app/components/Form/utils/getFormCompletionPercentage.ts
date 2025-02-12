import { JsonSchema } from '@jsonforms/core';

import { FormValues, PageType } from '../typings';

function getFormCompletionPercentage(
  schema: JsonSchema,
  pages: PageType[],
  data: FormValues,
  currentPageIndex: number
) {
  const filteredData = {};

  pages.forEach((page) => {
    page.elements.forEach((element) => {
      const scope = element.scope.split('/').pop();
      if (!scope) {
        return;
      }
      const isRequired = (schema.required || []).includes(scope);
      const isPastCurrentPage = pages.indexOf(page) < currentPageIndex;

      if (isRequired) {
        filteredData[scope] = data[scope];
      } else {
        filteredData[scope] = isPastCurrentPage ? 'filled' : data[scope];
      }
    });
  });

  const totalKeys = Object.keys(filteredData).length;
  const keysWithValues = Object.values(filteredData).filter(
    (value) => value !== undefined
  ).length;
  const percentage = (keysWithValues / totalKeys) * 100;

  return percentage;
}

export default getFormCompletionPercentage;
