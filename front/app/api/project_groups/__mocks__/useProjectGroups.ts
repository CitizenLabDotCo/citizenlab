import { IProjectGroupData } from '../types';

export const projectGroups: IProjectGroupData[] = [
  {
    id: '08820094-74af-49df-baea-574a2b34beeb',
    type: 'groups_project',
    relationships: {
      group: {
        data: {
          id: 'eab401fa-d938-4d14-8b30-3b727e84dfa5',
          type: 'group',
        },
      },
    },
  },
  {
    id: '105ca885-976c-4377-85b5-4bbf27ccff59',
    type: 'groups_project',
    relationships: {
      group: {
        data: {
          id: 'eab401fa-d938-4d14-8b30-3b727e84dfa5',
          type: 'group',
        },
      },
    },
  },
  {
    id: '350a14a2-d084-4a82-823e-3218ccdcd6bc',
    type: 'groups_project',
    relationships: {
      group: {
        data: {
          id: 'eab401fa-d938-4d14-8b30-3b727e84dfa5',
          type: 'group',
        },
      },
    },
  },
];

export default jest.fn(() => {
  return { data: { data: projectGroups } };
});
