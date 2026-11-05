export interface FieldArrayOperations {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  insert: (index: number, value: any) => void;
  move: (indexA: number, indexB: number) => void;
  remove: (index?: number | number[]) => void;
}
