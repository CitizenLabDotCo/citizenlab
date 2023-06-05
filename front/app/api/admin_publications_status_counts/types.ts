import { Keys } from 'utils/cl-react-query/types';
import adminPublicationsStatusCountsKeys from './keys';

export type AdminPublicationsStatusCountsKeys = Keys<
  typeof adminPublicationsStatusCountsKeys
>;

export interface IStatusCountsBase {
  draft?: number;
  published?: number;
  archived?: number;
}

export interface IStatusCounts {
  data: {
    type: 'status_counts';
    attributes: {
      status_counts: IStatusCountsBase;
    };
  };
}

export interface IStatusCountsAll extends IStatusCountsBase {
  all: number;
}
