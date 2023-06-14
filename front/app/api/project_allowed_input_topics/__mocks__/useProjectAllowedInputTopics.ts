import { IProjectAllowedInputTopicData } from '../types';

export const projectAllowedInputTopics: IProjectAllowedInputTopicData[] = [
  {
    id: '08820094-74af-49df-baea-574a2b34beeb',
    type: 'projects_allowed_input_topic',
    attributes: { ordering: 0 },
    relationships: {
      project: {
        data: { id: 'eab401fa-d938-4d14-8b30-3b727e84dfa5', type: 'project' },
      },
      topic: {
        data: { id: '61bbd6b2-6804-43e9-9a42-90b5150b21b4', type: 'topic' },
      },
    },
  },
  {
    id: '105ca885-976c-4377-85b5-4bbf27ccff59',
    type: 'projects_allowed_input_topic',
    attributes: { ordering: 1 },
    relationships: {
      project: {
        data: { id: 'eab401fa-d938-4d14-8b30-3b727e84dfa5', type: 'project' },
      },
      topic: {
        data: { id: 'ff102809-987c-461f-8ac0-40776afd2be9', type: 'topic' },
      },
    },
  },
  {
    id: '350a14a2-d084-4a82-823e-3218ccdcd6bc',
    type: 'projects_allowed_input_topic',
    attributes: { ordering: 2 },
    relationships: {
      project: {
        data: { id: 'eab401fa-d938-4d14-8b30-3b727e84dfa5', type: 'project' },
      },
      topic: {
        data: { id: '7441099b-a8b7-4f88-854e-4aab89921277', type: 'topic' },
      },
    },
  },
];

export default jest.fn(() => {
  return { data: { data: projectAllowedInputTopics } };
});
