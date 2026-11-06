import { ChipState } from './Chip';

const chipsOf = (labels: string[], state: ChipState) =>
  labels.map((label) => ({ label, state }));

export const getChips = (labels: string[], previousLabels: string[]) => {
  const kept = labels.filter((label) => previousLabels.includes(label));
  const added = labels.filter((label) => !previousLabels.includes(label));
  const removed = previousLabels.filter((label) => !labels.includes(label));

  return [
    ...chipsOf(kept, 'saved'),
    ...chipsOf(added, 'added'),
    ...chipsOf(removed, 'removed'),
  ];
};
