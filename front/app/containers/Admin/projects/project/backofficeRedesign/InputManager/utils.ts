import { IIdeaData } from 'api/ideas/types';

export const topicIds = (idea: IIdeaData) =>
  idea.relationships.input_topics?.data.map((topic) => topic.id) ?? [];

export const phaseIds = (idea: IIdeaData) =>
  idea.relationships.phases.data.map((phase) => phase.id);

export const toggled = (values: string[], value: string) =>
  values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
