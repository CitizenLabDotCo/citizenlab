import { UISchemaElement } from '@jsonforms/core';
import { ErrorObject } from 'ajv';

import { MessageDescriptor } from 'utils/cl-intl';

export type AjvErrorGetter = (
  error: ErrorObject,
  uischema?: UISchemaElement
) => MessageDescriptor | undefined;

export type ApiErrorGetter = (
  errorKey: string,
  fieldName: string
) => MessageDescriptor | undefined;

export type FormData = Record<string, any> | null | undefined;
