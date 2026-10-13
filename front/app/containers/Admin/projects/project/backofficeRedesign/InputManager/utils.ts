import { IIdeaData } from 'api/ideas/types';

export const topicIds = (idea: IIdeaData) =>
  idea.relationships.input_topics?.data.map((topic) => topic.id) ?? [];

export const phaseIds = (idea: IIdeaData) =>
  idea.relationships.phases.data.map((phase) => phase.id);
