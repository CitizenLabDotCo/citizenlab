import { keys } from 'lodash-es';

import { IStatusCounts } from '../types';

const getStatusCounts = (counts: IStatusCounts) => {
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const all: number = keys(counts?.data.attributes.status_counts).reduce(
    (statusCountTotal, status) => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const statusCount = counts?.data.attributes.status_counts[status];
      return statusCount ? statusCountTotal + statusCount : statusCountTotal;
    },
    0
  );
  return {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    ...counts?.data.attributes.status_counts,
    all,
  };
};

export default getStatusCounts;
