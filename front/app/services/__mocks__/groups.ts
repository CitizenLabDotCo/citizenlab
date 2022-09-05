import { GetGroupsChildProps } from 'resources/GetGroups';

export const mockGetGroups = {
  queryParameters: {
    'page[number]': 1,
    'page[size]': 250,
  },
  groupsList: [
    {
      id: 'test_group_id',
      type: 'group',
      attributes: {
        title_multiloc: {
          en: 'Test Group',
          'fr-BE': 'Groupe de test',
        },
        slug: 'test_group',
        memberships_count: 55,
        membership_type: 'manual',
      },
    },
  ],
  hasMore: false,
  querying: true,
  loadingMore: false,
} as GetGroupsChildProps;
