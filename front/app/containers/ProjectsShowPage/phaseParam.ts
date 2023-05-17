import { IPhaseData } from 'api/phases/types';

// https://stackoverflow.com/a/10834843
function isIntegerOverZero(str: string | undefined) {
  if (str === undefined) return false;
  const n = Math.floor(Number(str));
  return n !== Infinity && String(n) === str && n > 0;
}

function phaseExists(phaseParam: string, phases: IPhaseData[]) {
  return +phaseParam <= phases.length;
}

export function isValidPhase(
  phaseParam: string | undefined,
  phases: IPhaseData[]
) {
  if (phaseParam === undefined) return false;
  return isIntegerOverZero(phaseParam) && phaseExists(phaseParam, phases);
}
