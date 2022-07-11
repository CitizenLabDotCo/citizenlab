import { Bins } from '.'

export const updateLowerBound = (
  bins: Bins,
  groupIndex: number,
  newValue: number
): Bins => {
  const binsCloned: Bins = bins.map((bin) => ([...bin]));
  binsCloned[groupIndex][0] = newValue;

  if (!binsNeedFixing(binsCloned)) return binsCloned; 

  return binsCloned;
}

const binsNeedFixing = (bins: Bins) => {
  for (let i = 0; i < bins.length; i++) {
    const bin = bins[i];

    if (bin[0] >= bin[1]) return true;

    if (i !== 0) {
      const previousBin = bins[i - 1];
      
    }

    if (i !== bins.length - 1) {

    }
  }

  return false;
}