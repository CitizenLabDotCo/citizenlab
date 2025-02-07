import { Layout, JsonSchema7 } from '@jsonforms/core';
import { isEmpty } from 'lodash-es';

import { PageCategorization, PageType } from '../typings';

import customAjv from './customAjv';
import isVisible from './isVisible';

const isValidData = (
  schema: JsonSchema7,
  uiSchema: Layout | PageCategorization,
  data: Record<string, any>,
  isSurvey = false
) => {
  const [schemaToUse, dataWithoutHiddenFields] = getFormSchemaAndData(
    schema,
    uiSchema,
    data
  );

  return customAjv.validate(
    schemaToUse,
    isSurvey ? dataWithoutHiddenFields : data
  );
};

export default isValidData;

const iterateSchema = (
  uischema,
  parent,
  toApply: (uischema, parent) => void
): void => {
  if (isEmpty(uischema)) {
    return;
  }
  if (uischema?.elements) {
    uischema.elements.forEach((child) =>
      iterateSchema(child, uischema, toApply)
    );
    return;
  }
  toApply(uischema, parent);
};

const getFormSchemaAndData = (
  schema: JsonSchema7,
  uiSchema: Layout | PageCategorization,
  data: Record<string, any>
) => {
  const dataWithoutHiddenElements = {};
  const visibleElements: string[] = [];

  iterateSchema(uiSchema, uiSchema, (element, parentSchema) => {
    // If saving a draft response, we only want to validate the answers
    // against pages up to and including the latest completed page.
    if (data.latest_complete_page >= 0 && data.publication_status === 'draft') {
      // Get the index of the current page we're iterating in the uiSchema.
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const indexCurrentElement = uiSchema?.elements?.findIndex(
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (page) => page?.options?.id === parentSchema?.options?.id
      );

      // If the index of the current page is greater than the latest completed page
      // we don't want to include it in our validation check.
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (indexCurrentElement > data?.latest_complete_page) {
        return;
      }
    }

    const key: string = element.scope.split('/').pop();

    const showInData =
      parentSchema.type === 'Page'
        ? isVisible(
            parentSchema,
            data,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            uiSchema.elements as PageType[]
          )
        : true;

    if (showInData) {
      dataWithoutHiddenElements[key] = data[key];
      visibleElements.push(key);
    }
  });

  const schemaResult = Object.assign({}, schema, {
    required: (schema.required || []).filter((requiredElement) =>
      visibleElements.includes(requiredElement)
    ),
  });

  return [schemaResult, dataWithoutHiddenElements];
};
