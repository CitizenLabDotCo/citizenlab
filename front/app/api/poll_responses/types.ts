import { Keys } from 'utils/cl-react-query/types';
import pollResponsesKeys from './keys';
import { IParticipationContextType } from 'typings';

export type PollResponsesKeys = Keys<typeof pollResponsesKeys>;

export interface IPollResponses {
  data: {
    type: 'responses_count';
    attributes: { series: { [key: string]: number } };
  };
}

export type IPollResponseParameters = {
  participationContextId: string;
  participationContextType: IParticipationContextType;
};
