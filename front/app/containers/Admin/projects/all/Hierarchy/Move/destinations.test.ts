import { getDestinations, getHereKey } from './destinations';

const spaces = [
  { id: 's1', title: 'Mobility' },
  { id: 's2', title: 'Climate' },
];
const folders = [
  { id: 'f2', title: 'Parking', spaceId: 's1' },
  { id: 'f1', title: 'Bikes', spaceId: 's1' },
  { id: 'f3', title: 'Trees', spaceId: 's2' },
  { id: 'f4', title: 'Archive', spaceId: null },
];
const noneLabel = 'No space';

const keysOf = (params: Parameters<typeof getDestinations>[0]) =>
  getDestinations(params).map((destination) => destination.key);

describe('getDestinations', () => {
  it('lists each space with its folders for a project, then the rest for admins', () => {
    expect(
      keysOf({ item: 'project', spaces, folders, isAdmin: true, noneLabel })
    ).toEqual([
      'space:s1',
      'folder:f1',
      'folder:f2',
      'space:s2',
      'folder:f3',
      'folder:f4',
      'none',
    ]);
  });

  it('keeps managers in their spaces', () => {
    expect(
      keysOf({
        item: 'project',
        spaces: [spaces[0]],
        folders,
        isAdmin: false,
        noneLabel,
      })
    ).toEqual(['space:s1', 'folder:f1', 'folder:f2']);
  });

  it('only offers spaces to a folder', () => {
    expect(
      keysOf({ item: 'folder', spaces, folders, isAdmin: true, noneLabel })
    ).toEqual(['space:s1', 'space:s2', 'none']);
  });

  it('puts a project in a folder, and in its space with it', () => {
    const [, bikes] = getDestinations({
      item: 'project',
      spaces,
      folders,
      isAdmin: true,
      noneLabel,
    });
    expect(bikes).toMatchObject({
      label: 'Bikes',
      detail: 'Mobility',
      placement: { folder_id: 'f1', space_id: 's1' },
    });
  });

  it('takes a project out of its folder when it moves to a space', () => {
    const [mobility] = getDestinations({
      item: 'project',
      spaces,
      folders,
      isAdmin: true,
      noneLabel,
    });
    expect(mobility.placement).toEqual({ folder_id: null, space_id: 's1' });
  });
});

describe('getHereKey', () => {
  it('finds the folder first, then the space', () => {
    expect(getHereKey({ folder_id: 'f1', space_id: 's1' })).toBe('folder:f1');
    expect(getHereKey({ folder_id: null, space_id: 's1' })).toBe('space:s1');
    expect(getHereKey({ space_id: null })).toBe('none');
  });
});
