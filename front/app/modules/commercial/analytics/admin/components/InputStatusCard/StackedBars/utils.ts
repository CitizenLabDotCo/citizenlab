import { CornerRadius } from 'components/admin/Graphs/typings';

export const getCornerRadius =
  (stackLength: number, cornerRadius: number) =>
  ({ stackIndex }: { stackIndex: number }): CornerRadius => {
    const r = cornerRadius;
    if (stackIndex === 0 && stackLength === 1) return [r, r, r, r];
    if (stackIndex === 0) return [r, 0, 0, r];
    if (stackIndex === stackLength - 1) return [0, r, r, 0];

    return 0;
  };
