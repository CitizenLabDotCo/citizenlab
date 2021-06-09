import { IInappropriateContentFlagData } from './services/inappropriateContentFlags';

export function isFlagActive(flag: IInappropriateContentFlagData) {
  return flag.attributes.reason_code !== null;
}
