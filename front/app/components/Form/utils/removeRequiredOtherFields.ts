import { JsonSchema } from '@jsonforms/core';

import { FormValues } from '../typings';

const removeRequiredOtherFields = (schema: JsonSchema, data: FormValues) => {
  return {
    ...schema,
    required: (schema.required ?? []).filter((fieldKey) => {
      if (fieldKey.endsWith('_other')) {
        const otherFieldKey = fieldKey.slice(0, -6);

        if (Array.isArray(data[otherFieldKey])) {
          return data[otherFieldKey].includes('other');
        }

        return data[otherFieldKey] === 'other';
      }

      return true;
    }),
  };
};

export default removeRequiredOtherFields;
