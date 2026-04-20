import { getModeratedItems } from './utils';

describe('getModeratedItems', () => {
  describe('without spaces', () => {
    const treeView = {
      data: {
        type: 'tree_view',
        attributes: {
          nodes: [
            {
              id: '2ab3aba5-ceff-412b-a1a8-90dde88338d2',
              type: 'project',
              title_multiloc: {
                en: 'An idea? Bring it to your council!',
              },
            },
            {
              id: '96367438-271a-49cc-8cfa-d0f77f262fb5',
              type: 'folder',
              title_multiloc: {
                en: 'Repellat odio sed rerum.',
              },
              children: [],
            },
            {
              id: '102b2c70-4433-4e42-b0bc-310da4c74712',
              type: 'folder',
              title_multiloc: {
                en: 'Quisquam eum cupiditate beatae.',
              },
              children: [
                {
                  id: 'd9cfe258-583f-4cb3-a5c4-f0dca10011c8',
                  type: 'project',
                  title_multiloc: {
                    en: 'Help out as a volunteer',
                  },
                },
              ],
            },
            {
              id: 'cad238b7-54e3-4fcd-ac95-7b63b74f96ea',
              type: 'project',
              title_multiloc: {
                en: 'Mixed 3 methods project',
              },
            },
            {
              id: '88d5645d-be28-4280-89da-a558c84c6efb',
              type: 'project',
              title_multiloc: {
                en: 'Archived project',
              },
            },
            {
              id: 'ac89d556-fa14-4cc4-9a66-0a55ccbc1926',
              type: 'project',
              title_multiloc: {
                en: 'Community monitor',
              },
            },
          ],
        },
      },
    };

    it('works', () => {
      const user = {
        id: '546335a3-33b9-471c-a18a-d5b58ebf173a',
        type: 'user',
        attributes: {
          roles: [
            {
              type: 'project_moderator',
              project_id: '2ab3aba5-ceff-412b-a1a8-90dde88338d2',
            },
            {
              type: 'project_folder_moderator',
              project_folder_id: '102b2c70-4433-4e42-b0bc-310da4c74712',
            },
          ],
        },
      };

      const expectedOutcome = {
        projectsUserModerates: [
          {
            id: '2ab3aba5-ceff-412b-a1a8-90dde88338d2',
            type: 'project',
            title_multiloc: {
              en: 'An idea? Bring it to your council!',
            },
          },
        ],
        foldersUserModerates: [
          {
            id: '102b2c70-4433-4e42-b0bc-310da4c74712',
            type: 'folder',
            title_multiloc: {
              en: 'Quisquam eum cupiditate beatae.',
            },
            children: [
              {
                id: 'd9cfe258-583f-4cb3-a5c4-f0dca10011c8',
                type: 'project',
                title_multiloc: {
                  en: 'Help out as a volunteer',
                },
              },
            ],
          },
        ],
        spacesUserModerates: [],
      };

      expect(getModeratedItems(user as any, treeView as any)).toEqual(
        expectedOutcome
      );
    });

    it('works if user is PM of nested project', () => {
      const user = {
        id: '52cb9854-1bef-4328-a3ba-456d01240a1d',
        type: 'user',
        attributes: {
          roles: [
            {
              type: 'project_moderator',
              project_id: 'd9cfe258-583f-4cb3-a5c4-f0dca10011c8',
            },
          ],
        },
      };

      const expectedOutcome = {
        projectsUserModerates: [
          {
            id: 'd9cfe258-583f-4cb3-a5c4-f0dca10011c8',
            type: 'project',
            title_multiloc: {
              en: 'Help out as a volunteer',
            },
          },
        ],
        foldersUserModerates: [],
        spacesUserModerates: [],
      };

      expect(getModeratedItems(user as any, treeView as any)).toEqual(
        expectedOutcome
      );
    });
  });

  describe('with spaces', () => {
    const treeView = {
      data: {
        type: 'tree_view',
        attributes: {
          nodes: [
            {
              id: '897cbdeb-7923-4417-9dde-c1969afb0367',
              type: 'space',
              title_multiloc: {
                en: 'Space1',
              },
              children: [
                {
                  id: 'f69c1cb0-c3a8-4fb4-8fce-16b8cf6cedfc',
                  type: 'folder',
                  title_multiloc: {
                    en: 'Et fuga nobis dolores.',
                  },
                  children: [
                    {
                      id: '2bbec063-bc26-4c8d-ba5b-8d466a5491b4',
                      type: 'project',
                      title_multiloc: {
                        en: 'Mixed 3 methods project',
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: 'f0eebeed-632b-425f-a8a8-3e984442170b',
              type: 'space',
              title_multiloc: {
                en: 'Space2',
              },
              children: [],
            },
            {
              id: '4a0174bf-bf59-48f3-8c85-d85bd885a03b',
              type: 'folder',
              title_multiloc: {
                en: 'Doloremque quia ut ipsa.',
              },
              children: [],
            },
            {
              id: '65fe3dca-376d-4b8b-97db-8f755a8a948d',
              type: 'project',
              title_multiloc: {
                en: 'Archived project',
              },
            },
            {
              id: 'd5e251ea-1285-4f2e-af60-e0f25c34a9ce',
              type: 'project',
              title_multiloc: {
                en: 'Help out as a volunteer',
              },
            },
            {
              id: '096a909c-2da5-4840-b60b-fc79ca8bc7a3',
              type: 'project',
              title_multiloc: {
                en: 'Community monitor',
              },
            },
            {
              id: '93d93296-4fe5-474e-a6e9-ed359d4c7b96',
              type: 'project',
              title_multiloc: {
                en: 'An idea? Bring it to your council!',
              },
            },
          ],
        },
      },
    } as const;

    it('works', () => {
      const user = {
        id: '546335a3-33b9-471c-a18a-d5b58ebf173a',
        type: 'user',
        attributes: {
          roles: [
            {
              type: 'space_moderator',
              space_id: '897cbdeb-7923-4417-9dde-c1969afb0367',
            },
            {
              type: 'project_folder_moderator',
              project_folder_id: 'f69c1cb0-c3a8-4fb4-8fce-16b8cf6cedfc',
            },
          ],
        },
      };

      const expectedOutcome = {
        projectsUserModerates: [],
        foldersUserModerates: [treeView.data.attributes.nodes[0].children[0]],
        spacesUserModerates: [treeView.data.attributes.nodes[0]],
      };

      expect(getModeratedItems(user as any, treeView as any)).toEqual(
        expectedOutcome
      );
    });
  });
});
