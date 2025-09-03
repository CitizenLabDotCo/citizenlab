// Returns boolean depending on whether the 'other' text field should be below
const hasOtherTextFieldBelow = (schema: any, data: any): boolean => {
  const key = schema.scope?.split('/').pop();
  return (
    key &&
    (Array.isArray(data[key])
      ? data[key].includes('other')
      : data[key] === 'other')
  );
};

export default hasOtherTextFieldBelow;
