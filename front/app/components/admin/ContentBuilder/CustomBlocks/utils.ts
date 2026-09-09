import {
  BlockConfigField,
  BlockConfigValues,
} from 'api/custom_blocks/types';

export const defaultConfigValues = (
  schema: BlockConfigField[]
): BlockConfigValues => {
  const values: BlockConfigValues = {};
  schema.forEach((field) => {
    if (field.default !== undefined) {
      values[field.key] = field.default;
    }
  });
  return values;
};
