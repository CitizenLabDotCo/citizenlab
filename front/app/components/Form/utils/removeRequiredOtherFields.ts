const removeRequiredOtherFields = (requiredFields: string[]) => {
  return requiredFields.filter((field) => !field.endsWith('other'));
};

export default removeRequiredOtherFields;
