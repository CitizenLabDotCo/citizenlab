import { getAddableNodes } from './getAddableNodes';

// A tree with: a root project, a root folder containing a project, and a space
// containing a project (the latter is already in a space, so never addable).
const treeView = {
  data: {
    type: 'tree_view',
    attributes: {
      nodes: [
        {
          id: 'root-project',
          type: 'project',
          title_multiloc: { en: 'Root project' },
        },
        {
          id: 'root-folder',
          type: 'folder',
          title_multiloc: { en: 'Root folder' },
          children: [
            {
              id: 'project-in-folder',
              type: 'project',
              title_multiloc: { en: 'Project in folder' },
            },
          ],
        },
        {
          id: 'space',
          type: 'space',
          title_multiloc: { en: 'Space' },
          children: [
            {
              id: 'project-in-space',
              type: 'project',
              title_multiloc: { en: 'Project in space' },
            },
          ],
        },
      ],
    },
  },
};

const userWithRoles = (roles: Record<string, unknown>[]) => ({
  id: 'user-id',
  type: 'user',
  attributes: { roles },
});

const ids = (roles: Record<string, unknown>[]) =>
  getAddableNodes({ data: userWithRoles(roles) } as any, treeView as any).map(
    (node) => node.id
  );

describe('getAddableNodes', () => {
  it('offers all root folders and projects (including projects inside root folders) to an admin', () => {
    expect(ids([{ type: 'admin' }])).toEqual([
      'root-folder',
      'root-project',
      'project-in-folder',
    ]);
  });

  it('never offers a project that is already in a space', () => {
    expect(ids([{ type: 'admin' }])).not.toContain('project-in-space');
  });

  it('offers nothing to a space moderator with no other moderation rights', () => {
    expect(ids([{ type: 'space_moderator', space_id: 'space' }])).toEqual([]);
  });

  it('lets a folder moderator add their folder and pull the projects out of it', () => {
    expect(
      ids([
        { type: 'project_folder_moderator', project_folder_id: 'root-folder' },
      ])
    ).toEqual(['root-folder', 'project-in-folder']);
  });

  it('lets a project moderator add the project they moderate, even when it lives in a folder', () => {
    expect(
      ids([{ type: 'project_moderator', project_id: 'project-in-folder' }])
    ).toEqual(['project-in-folder']);
  });

  it('does not offer a folder or its projects to a moderator of an unrelated project', () => {
    expect(
      ids([{ type: 'project_moderator', project_id: 'root-project' }])
    ).toEqual(['root-project']);
  });
});
