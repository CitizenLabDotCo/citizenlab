import moment from 'moment';

import { RawData } from './typings';

type BinFunction = (birthYear: string) => string | null;

type BinOptions = BinOptionsDefault | BinOptionsCustom;

interface BinOptionsDefault {
  missingBin?: string;
}

interface BinOptionsCustom {
  binFunction: BinFunction;
  bins: string[];
  missingBin?: string;
}

const binAge = (data: RawData, binOptions?: BinOptions) => {
  const { binFunction, bins, missingBin } = {
    binFunction: defaultBinFunction,
    bins: defaultBins,
    missingBin: '_blank',
    ...binOptions,
  };

  const binsMap = initBinsMap(bins, missingBin);

  for (const birthYear in data) {
    const bin = binFunction(birthYear) || missingBin;
    const count = data[birthYear];
    binsMap[bin] += count;
  }

  return toSeries(binsMap);
};

export default binAge;

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
