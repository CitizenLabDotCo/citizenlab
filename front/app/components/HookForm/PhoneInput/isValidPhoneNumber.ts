// The utils library is heavy, so we import it dynamically to keep it out of the
// main bundle. PhoneInput loads the same module through its `loadUtils` prop, so
// it is bundled once and only fetched once. We cache the module here so repeated
// calls reuse it instead of resolving a new import each time.
let utils: typeof import('intl-tel-input/utils').default | undefined;

const isValidPhoneNumber = async (value: string): Promise<boolean> => {
  if (!utils) {
    const { default: utilsImport } = await import('intl-tel-input/utils');
    utils = utilsImport;
  }

  return utils.isValidNumber(value, undefined);
};

export default isValidPhoneNumber;
