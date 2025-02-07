import { JsonSchema } from '@jsonforms/core';

import { PageType } from '../typings';

function getFormCompletionPercentage(
  schema: JsonSchema,
  pages: PageType[],
  data: Record<string, any>,
  currentPageIndex: number
) {
  const filteredData = {};

  pages.forEach((page) => {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (page.elements) {
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
    }
  });

  const totalKeys = Object.keys(filteredData).length;
  const keysWithValues = Object.values(filteredData).filter(
    (value) => value !== undefined
  ).length;
  const percentage = (keysWithValues / totalKeys) * 100;

  return percentage;
}

export default getFormCompletionPercentage;
