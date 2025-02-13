import { and, isCategorization, Tester, uiTypeIs } from '@jsonforms/core';
import { isEmpty } from 'lodash-es';

import { PageCategorization } from '../typings';

const isPageCategorization: Tester = and(
  uiTypeIs('Categorization'),
  (uischema) => {
    const hasPage = (element: PageCategorization): boolean => {
      if (isEmpty(element.elements)) {
        return false;
      }

      return element.elements
        .map((elem) =>
          // eslint-disable-next-line
          isCategorization(elem) ? hasPage(elem) : elem.type === 'Page'
        )
        .reduce((prev, curr) => prev && curr, true);
    };

    return hasPage(uischema as PageCategorization);
  }
);

export default isPageCategorization;
