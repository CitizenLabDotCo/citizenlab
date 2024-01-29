import { Multiloc } from 'typings';

export interface Props {
  title?: Multiloc;
  projectId?: string;
  phaseId?: string;
  numberOfIdeas: number;
  collapseLongText: boolean;
}
