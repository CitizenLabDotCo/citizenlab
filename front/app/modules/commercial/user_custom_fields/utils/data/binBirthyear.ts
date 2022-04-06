import moment from 'moment';
import { RawData } from './typings';

type BinFunction = (birthYear: string) => string | null;

interface BinOptions {
  binFunction?: BinFunction;
  bins?: string[];
  missing?: string;
}

const binBirthyear = (data: RawData, binOptions?: BinOptions) => {
  const { binFunction, bins, missing } = {
    binFunction: defaultBinFunction,
    bins: defaultBins,
    missing: '_blank',
    ...binOptions,
  };

  const binsMap = initBinsMap(bins, missing);

  for (const birthYear in data) {
    const bin = binFunction(birthYear) || missing;
    const count = data[birthYear];
    binsMap[bin] += count;
  }

  return toSeries(binsMap);
};

export default binBirthyear;

export const defaultBinFunction: BinFunction = (birthYear: string) => {
  const currentYear = moment().year();
  const age = currentYear - parseInt(birthYear, 10);

  if (isNaN(age)) return null;

  if (age < 10) return '0 - 9';
  if (age >= 90) return '90+';

  const lowerBound = Math.floor(age / 10) * 10;
  return `${lowerBound} - ${lowerBound + 9}`;
};

const defaultBins = [
  '0 - 9',
  '10 - 19',
  '20 - 29',
  '30 - 39',
  '40 - 49',
  '50 - 59',
  '60 - 69',
  '70 - 79',
  '80 - 89',
  '90+',
];

const initBinsMap = (bins: string[], missing: string) => {
  return Object.fromEntries([...bins, missing].map((bin) => [bin, 0]));
};

const toSeries = (data: RawData) =>
  Object.entries(data).map(([name, value]) => ({ name, value }));
