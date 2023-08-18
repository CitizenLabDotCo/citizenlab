import { JsonSchema, Layout } from '@jsonforms/core';
import Ajv from 'ajv';
import { isEmpty, forOwn } from 'lodash-es';
import { isVisible } from './Components/Controls/visibilityUtils';
import { PageCategorization, PageType } from './Components/Layouts/utils';

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

export const getFormSchemaAndData = (
  schema: JsonSchema,
  uiSchema: Layout | PageCategorization,
  data: any,
  ajv: Ajv
) => {
  const dataWithoutHiddenElements = {};
  const visibleElements: string[] = [];

  iterateSchema(uiSchema, uiSchema, (element, parentSchema) => {
    const key: string = element.scope.split('/').pop();
    const isPageVisible = isVisible(
      parentSchema,
      data,
      '',
      ajv,
      uiSchema?.elements as PageType[]
    );
    const isElementVisible = isVisible(element, data, '', ajv);
    const showInData =
      parentSchema.type === 'Page'
        ? isPageVisible && isElementVisible
        : isElementVisible;

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

export const sanitizeFormData = (data: any) => {
  const sanitizedFormData = {};

  forOwn(data, (value, key) => {
    sanitizedFormData[key] =
      value === null || value === '' || value === false ? undefined : value;
  });

  return sanitizedFormData;
};

export const isValidData = (
  schema: JsonSchema,
  uiSchema: Layout | PageCategorization,
  data: any,
  ajv: Ajv,
  isSurvey: boolean
) => {
  const [schemaToUse, dataWithoutHiddenFields] = getFormSchemaAndData(
    schema,
    uiSchema,
    data,
    ajv
  );

  return ajv.validate(schemaToUse, isSurvey ? dataWithoutHiddenFields : data);
};
