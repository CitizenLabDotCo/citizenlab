import { UISchemaElement } from '@jsonforms/core';
import { ErrorObject } from 'ajv';
import { Message } from 'typings';

export type AjvErrorGetter = (
  error: ErrorObject,
  uischema?: UISchemaElement
) => Message | undefined;

export type ApiErrorGetter = (
  errorKey: string,
  fieldName: string
) => Message | undefined;

export type FormData = Record<string, any> | null | undefined;
