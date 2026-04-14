import { getLists } from './utils';

describe('getLists', () => {
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
    };

    expect(getLists(user as any, treeView as any)).toEqual(expectedOutcome);
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
    };

    expect(getLists(user as any, treeView as any)).toEqual(expectedOutcome);
  });
});
