import { Keys } from 'utils/cl-react-query/types';
import initiativeAllowedTransitonsKeys from './keys';

export type InitiativeAllowedTransitonsKeys = Keys<
  typeof initiativeAllowedTransitonsKeys
>;

export interface IInitiativeAllowedTransitions {
  data: {
    type: 'allowed_transitions';
    attributes: {
      [key: string]: {
        feedback_required: boolean;
      };
    };
  };
}
