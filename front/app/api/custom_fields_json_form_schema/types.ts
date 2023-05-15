import schemaKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';
import { Locale } from 'typings';
import { JsonSchema7, Layout } from '@jsonforms/core';

export type SchemaKeys = Keys<typeof schemaKeys>;

export interface SchemaResponse {
  data: {
    type: 'schema';
    attributes: {
      json_schema_multiloc: {
        [key in Locale]?: JsonSchema7;
      };
      ui_schema_multiloc: { [key in Locale]?: Layout };
    };
  };
}
