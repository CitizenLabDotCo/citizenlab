import { Moment } from 'moment';
import { IResolution } from 'components/admin/ResolutionControl';

export interface ProjectId {
  projectId: string | undefined;
}

export interface Dates {
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null;
}

export interface Resolution {
  resolution: IResolution;
}

export interface Pagination {
  pageSize: number;
  pageNumber: number;
}
