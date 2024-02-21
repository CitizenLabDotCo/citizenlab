import { Multiloc } from 'typings';

export interface Props {
  title?: Multiloc;
  showAuthor: boolean;
  showContent: boolean;
  showReactions: boolean;
  showVotes: boolean;
  collapseLongText: boolean;
  projectId?: string;
  phaseId?: string;
  ideaId?: string;
}
