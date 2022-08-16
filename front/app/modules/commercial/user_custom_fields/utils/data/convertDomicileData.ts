import { IUsersByRegistrationField, Option } from '../../services/stats';
import { RawData } from './typings';

const convertDomicileData = (
  options: IUsersByRegistrationField['options'],
  data: RawData,
  parseName: (key: string, value?: Option) => string
) => {
  return [...Object.keys(options), '_blank', 'outside'].map((key) => ({
    value: data[key],
    name: parseName(key, options[key]),
  }));
};

export default convertDomicileData;
