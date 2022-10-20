import { Moment } from 'moment';
import { IResolution } from 'components/admin/ResolutionControl';

export interface QueryParameters {
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null | undefined;
  resolution: IResolution;
}

// Response
export type Response = {
  data: []; // TODO
};
