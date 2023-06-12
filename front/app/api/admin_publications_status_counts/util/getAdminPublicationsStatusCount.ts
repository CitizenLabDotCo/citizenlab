import { keys } from 'lodash-es';
import { IStatusCounts } from '../types';

const getStatusCounts = (counts: IStatusCounts) => {
  const all: number = keys(counts?.data.attributes.status_counts).reduce(
    (statusCountTotal, status) => {
      const statusCount = counts?.data.attributes.status_counts[status];
      return statusCount ? statusCountTotal + statusCount : statusCountTotal;
    },
    0
  );
  return {
    ...counts?.data.attributes.status_counts,
    all,
  };
};

export default getStatusCounts;
