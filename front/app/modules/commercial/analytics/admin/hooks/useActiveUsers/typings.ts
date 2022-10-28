import { Moment } from 'moment';
import { IResolution } from 'components/admin/ResolutionControl';

export interface QueryParameters {
  projectId: string | undefined;
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null | undefined;
  resolution: IResolution;
}

// Response
export interface Response {
  data: any;
}
