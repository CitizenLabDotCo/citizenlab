import { getLandingLevel, getLevel, Level } from './level';

describe('getLandingLevel', () => {
  it('opens the only space when there is nothing else', () => {
    expect(
      getLandingLevel({ spaceIds: ['s1'], folderIds: [], projectsCount: 0 })
    ).toEqual({ kind: 'space', id: 's1' });
  });

  it('opens the only folder when there is nothing else', () => {
    expect(
      getLandingLevel({ spaceIds: [], folderIds: ['f1'], projectsCount: 0 })
    ).toEqual({ kind: 'folder', id: 'f1' });
  });

  it('stays at the top level when a space sits next to anything else', () => {
    expect(
      getLandingLevel({ spaceIds: ['s1'], folderIds: [], projectsCount: 2 })
    ).toEqual({ kind: 'root' });
    expect(
      getLandingLevel({ spaceIds: ['s1'], folderIds: ['f1'], projectsCount: 0 })
    ).toEqual({ kind: 'root' });
  });

  it('stays at the top level for several spaces, several folders or only projects', () => {
    expect(
      getLandingLevel({
        spaceIds: ['s1', 's2'],
        folderIds: [],
        projectsCount: 0,
      })
    ).toEqual({ kind: 'root' });
    expect(
      getLandingLevel({
        spaceIds: [],
        folderIds: ['f1', 'f2'],
        projectsCount: 0,
      })
    ).toEqual({ kind: 'root' });
    expect(
      getLandingLevel({ spaceIds: [], folderIds: [], projectsCount: 3 })
    ).toEqual({ kind: 'root' });
  });
});

describe('getLevel', () => {
  const landing: Level = { kind: 'space', id: 's1' };

  it('uses the folder, then the space, from the URL', () => {
    expect(getLevel({ folder_id: 'f1', space_id: 's2' }, landing)).toEqual({
      kind: 'folder',
      id: 'f1',
    });
    expect(getLevel({ space_id: 's2' }, landing)).toEqual({
      kind: 'space',
      id: 's2',
    });
  });

  it('falls back to where the user lands', () => {
    expect(getLevel({}, landing)).toEqual(landing);
  });
});
