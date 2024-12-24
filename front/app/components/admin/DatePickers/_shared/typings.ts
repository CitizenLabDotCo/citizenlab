import { TZDate } from '@date-fns/tz';

export type DateRange = {
  from: TZDate;
  to?: TZDate;
};
