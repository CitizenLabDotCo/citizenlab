import { IInputTopicData } from '../types';

export const mockInputTopic: IInputTopicData = {
  id: 'topic1',
  type: 'input_topic',
  attributes: {
    title_multiloc: { en: 'Mobility' },
    description_multiloc: {},
    full_title_multiloc: { en: 'Mobility' },
    icon: null,
    parent_icon: null,
    depth: 0,
    lft: 1,
    rgt: 2,
    children_count: 0,
  },
  relationships: {
    project: { data: { id: 'project1', type: 'project' } },
  },
};
