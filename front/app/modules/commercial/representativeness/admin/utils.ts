import { Bins } from './services/referenceDistribution';
import { indices } from 'utils/helperUtils';

export const getBinId = (
  lowerBound: number | null,
  upperBound: number | null,
  isLastBin: boolean
) => upperBound === null
  ? `${lowerBound}+`
  : `${lowerBound}-${upperBound - (isLastBin ? 0 : 1)}`

export const forEachBin = (bins: Bins) => indices(bins.length - 1).map((i) => {
  const lowerBound = bins[i];
  const upperBound = bins[i + 1];
  const isLastBin = i === bins.length - 2;

  return {
    lowerBound,
    upperBound,
    isLastBin,
    binId: getBinId(lowerBound, upperBound, isLastBin)
  }
})