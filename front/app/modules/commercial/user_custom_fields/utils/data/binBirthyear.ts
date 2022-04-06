import moment from 'moment';

type Data = Record<string, number>;
type BinFunction = (birthYear: string) => string;

interface BinOptions {
  binFunction: BinFunction;
  bins: string[];
}

const binBirthyear = (
  data: Data,
  { binFunction, bins }: BinOptions = {
    binFunction: defaultBinFunction,
    bins: defaultBins,
  }
) => {
  const binsMap = initBins(bins);

  for (const birthYear in data) {
    const bin = binFunction(birthYear);
    const count = data[birthYear];
    binsMap[bin] += count;
  }

  return toSeries(binsMap);
};

export default binBirthyear;

export const defaultBinFunction: BinFunction = (birthYear: string) => {
  const currentYear = moment().year();
  const age = currentYear - parseInt(birthYear, 10);

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

const initBins = (bins: string[]) =>
  Object.fromEntries(bins.map((bin) => [bin, 0]));
const toSeries = (data: Data) =>
  Object.entries(data).map(([name, value]) => ({ name, value }));
