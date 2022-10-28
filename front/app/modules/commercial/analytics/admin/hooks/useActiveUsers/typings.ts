import { ProjectId, Dates, Resolution } from '../../typings';

export type QueryParameters = ProjectId & Dates & Resolution;

// Response
export interface Response {
  data: any;
}
