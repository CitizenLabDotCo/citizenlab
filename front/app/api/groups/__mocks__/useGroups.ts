import { IGroupData } from '../types';

export const groupsData: IGroupData[] = [
  {
    id: '1',
    type: 'group',
    attributes: {
      title_multiloc: {
        en: 'Group 1',
      },
      membership_type: 'manual',
      memberships_count: 5,
    },
  },
  {
    id: '2',
    type: 'group',
    attributes: {
      title_multiloc: {
        en: 'Group 2',
      },
      membership_type: 'manual',
      memberships_count: 10,
    },
  },
];

export default jest.fn(() => {
  return { data: { data: groupsData } };
});
