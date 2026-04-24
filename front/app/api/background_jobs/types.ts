import { CLError, IRelationship } from 'typings';

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
      data: IRelationship;
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
