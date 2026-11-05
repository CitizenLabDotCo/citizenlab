import { ICustomFieldBins } from './types';

export const deduplicateBins = (bins: ICustomFieldBins): ICustomFieldBins => {
  const binType = bins.data[0]?.attributes.type;

  // Only implementing for age bins for now
  if (binType !== 'CustomFieldBins::AgeBin') {
    return bins;
  }

  const deduplicatedBins: ICustomFieldBins['data'] = [];
  const seenRanges = new Set<string>();

  for (const bin of bins.data) {
    const { range } = bin.attributes;
    if (!range) continue;

    const rangeKey = `${range.begin}-${range.end}`;
    if (!seenRanges.has(rangeKey)) {
      seenRanges.add(rangeKey);
      deduplicatedBins.push(bin);
    }
  }

  return { data: deduplicatedBins };
};
