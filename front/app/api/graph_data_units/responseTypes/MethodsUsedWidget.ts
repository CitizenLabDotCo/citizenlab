import { ParticipationMethod } from 'api/phases/types';

export type MethodsUsedResponse = {
  data: {
    type: 'report_builder_data_units';
    attributes: {
      count_per_method: Partial<Record<ParticipationMethod, number>>;
    };
  };
};
