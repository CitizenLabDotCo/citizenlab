import utils from 'intl-tel-input/utils';

const isValidPhoneNumber = (value: string): boolean =>
  utils.isValidNumber(value, undefined);

export default isValidPhoneNumber;
