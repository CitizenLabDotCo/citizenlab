import { CLError, IRelationship } from 'typings';

// A tracked background job (a Jobs::Tracker on the backend), as returned by
// the /jobs endpoint. See WebApi::V1::Jobs::TrackerSerializer.
export interface IJobData {
  id: string;
  type: 'job';
  attributes: {
    progress: number;
    error_count: number;
    total: number;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
    job_type: string;
    errors: CLError[];
  };
  relationships: {
    owner: {
      // null when the job's owner was deleted
      data: IRelationship | null;
    };
    project: {
      data: IRelationship;
    };
    context: {
      data: IRelationship;
    };
  };
}

export interface IJob {
  data: IJobData;
}

export interface IJobs {
  data: IJobData[];
}
