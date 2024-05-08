import { JsonSchema7, Layout } from '@jsonforms/core';
import { SupportedLocale } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import schemaKeys from './keys';

export type SchemaKeys = Keys<typeof schemaKeys>;

export interface SchemaResponse {
  data: {
    type: 'schema';
    attributes: {
      json_schema_multiloc: {
        [key in SupportedLocale]?: JsonSchema7;
      };
      ui_schema_multiloc: { [key in SupportedLocale]?: Layout };
    };
  };
}
