import { getOfferedFacets, toStateChoices } from './facets';

const all = { spacesEnabled: true, canListSpaces: true, canListFolders: true };

describe('getOfferedFacets', () => {
  it('offers every filter at the top level', () => {
    expect(getOfferedFacets({ kind: 'root' }, all)).toEqual([
      'managers',
      'display_status',
      'folder_ids',
      'participation_states',
      'participation_methods',
      'visibility',
      'discoverability',
      'space_ids',
      'start_date',
    ]);
  });

  it('drops the spaces filter inside a space, and folders inside a folder', () => {
    const inSpace = getOfferedFacets({ kind: 'space', id: 's' }, all);
    expect(inSpace).not.toContain('space_ids');
    expect(inSpace).toContain('folder_ids');

    const inFolder = getOfferedFacets({ kind: 'folder', id: 'f' }, all);
    expect(inFolder).not.toContain('space_ids');
    expect(inFolder).not.toContain('folder_ids');
  });

  it('drops the spaces filter when spaces are off or out of reach', () => {
    const level = { kind: 'root' } as const;
    expect(
      getOfferedFacets(level, { ...all, spacesEnabled: false })
    ).not.toContain('space_ids');
    expect(
      getOfferedFacets(level, { ...all, canListSpaces: false })
    ).not.toContain('space_ids');
  });

  it('drops the folders filter for someone who manages no folders', () => {
    expect(
      getOfferedFacets({ kind: 'root' }, { ...all, canListFolders: false })
    ).not.toContain('folder_ids');
  });
});

describe('toStateChoices', () => {
  it('widens part of a choice to all of it', () => {
    expect(toStateChoices(['informing'])).toEqual([
      'collecting_data',
      'informing',
    ]);
  });

  it('drops the states no choice offers', () => {
    expect(toStateChoices(['not_started', 'past'])).toEqual(['past']);
  });
});
