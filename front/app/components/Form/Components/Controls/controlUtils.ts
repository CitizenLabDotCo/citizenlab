// Given a schema and field type, returns the options for a given array field
export const getOptions = (schema, fieldType: 'single' | 'multi') => {
  if (fieldType === 'multi') {
    return (
      (!Array.isArray(schema.items) &&
        schema.items?.oneOf?.map((option) => ({
          value: option.const as string,
          label: (option.title || option.const) as string,
        }))) ||
      null
    );
  } else {
    return (
      schema?.oneOf
        ?.map((option) => ({
          value: option.const,
          label: option.title || option.const,
        }))
        .filter((e) => e.value && e.label) || null
    );
  }
};
