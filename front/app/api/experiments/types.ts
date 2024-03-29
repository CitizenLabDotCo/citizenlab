import { Keys } from 'utils/cl-react-query/types';

import experimentsKeys from './keys';

export type ExperimentsKeys = Keys<typeof experimentsKeys>;

export interface IExperimentData {
  id: string;
  type: 'experiment';
  attributes: {
    name: string;
    treatment: string;
    action: string;
  };
}

export interface IExperiment {
  data: IExperimentData;
}

export interface IExperiments {
  data: IExperimentData[];
}

export interface IExperimentAdd {
  name: string;
  treatment: string;
  action: string;
}
