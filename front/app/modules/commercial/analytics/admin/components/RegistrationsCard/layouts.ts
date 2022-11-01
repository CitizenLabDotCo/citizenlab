import { BoxLayout } from '../../typings';

export const STATS_CONTAINER_LAYOUT: BoxLayout = {
  wide: { mt: '32px' },
  narrow: { ml: '32px', width: '50%' },
};

export const GRAPHS_OUTER_LAYOUT: BoxLayout = {
  wide: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    pr: '20px',
  },
  narrow: {
    width: '100%',
    mt: '20px',
  },
};

export const GRAPHS_INNER_LAYOUT: BoxLayout = {
  wide: {
    width: '95%',
    maxWidth: '800px',
    mt: '-1px',
  },
  narrow: { width: '100%' },
};
