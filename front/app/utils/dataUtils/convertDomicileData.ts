import { Multiloc } from 'typings';

import { RawData } from './typings';

export type AreaValue = {
  title_multiloc: Multiloc;
};
type Areas = {
  [key: string]: AreaValue;
};

const convertDomicileData = (
  areas: Areas,
  data: RawData,
  parseName: (key: string, value?: AreaValue) => string
) => {
  return [...Object.keys(areas), '_blank'].map((key) => ({
    value: data[key],
    name: parseName(key, areas[key]),
  }));
};

export default convertDomicileData;
