// The utils library is heavy, so we import it dynamically to keep it out of the
// main bundle. PhoneInput loads the same module through its `loadUtils` prop, so
// it is bundled once and only fetched once.
const isValidPhoneNumber = async (value: string): Promise<boolean> => {
  const { default: utils } = await import('intl-tel-input/utils');
  return utils.isValidNumber(value, undefined);
};

export default isValidPhoneNumber;
