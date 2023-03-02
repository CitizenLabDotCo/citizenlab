import initiativesCountKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';
import { IQueryParameters } from 'api/initiatives/types';
export type InitiativesCountKeys = Keys<typeof initiativesCountKeys>;

export type IInitiativesCount = {
  data: {
    type: 'initiatives_count';
    attributes: {
      count: number;
    };
  };
};

export { IQueryParameters };
