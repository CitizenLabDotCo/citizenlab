import { Moment } from 'moment';

export const formatMoment = (moment: Moment | null | undefined) => {
  return moment?.format('yyyy-MM-DD');
};
