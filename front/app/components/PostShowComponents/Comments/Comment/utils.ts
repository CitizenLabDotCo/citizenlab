import { IInitiativeData } from 'api/initiatives/types';
import { IIdeaData } from 'api/ideas/types';

export const postIsIdea = (
  post: IIdeaData | IInitiativeData
): post is IIdeaData => post.type === 'idea';
export const postIsInitiative = (
  post: IIdeaData | IInitiativeData
): post is IInitiativeData => post.type === 'initiative';
