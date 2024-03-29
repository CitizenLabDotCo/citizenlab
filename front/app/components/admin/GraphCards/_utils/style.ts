import { Layout } from 'components/admin/GraphCards/typings';
import { Margin } from 'components/admin/Graphs/typings';

export const MARGINS: Record<Layout, Margin | undefined> = {
  wide: { top: 10 },
  narrow: {
    top: 10,
    left: -25,
    right: 35,
  },
};
