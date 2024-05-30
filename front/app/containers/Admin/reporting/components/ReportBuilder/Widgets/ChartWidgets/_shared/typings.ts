import { Moment } from 'moment';

export interface Props {
  onChangeDateRange?: ({
    startDate,
    endDate,
  }: {
    startDate: Moment | null;
    endDate: Moment | null;
  }) => void;
}
