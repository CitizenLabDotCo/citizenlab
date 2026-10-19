import useFeatureFlag from 'hooks/useFeatureFlag';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { usePermission } from 'utils/permissions';
import { useSearch } from 'utils/router';

import { Level } from '../level';

import {
  FacetKey,
  ListFacetKey,
  facetKeys,
  getOfferedFacets,
  isListFacet,
  toStateChoices,
} from './facets';

const DATE_PARAMS = ['min_start_date', 'max_start_date'];

const useFacets = (level: Level) => {
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });
  const canListSpaces = usePermission({ item: 'space', action: 'list' });
  const canListFolders = usePermission({
    item: 'project_folder',
    action: 'list_for_admin',
  });

  return getOfferedFacets(level, {
    spacesEnabled,
    canListSpaces,
    canListFolders,
  });
};

// The search and the filters of a level, as they are in the URL. Either one
// turns the level into a flat list of the projects that match, from this level
// down.
const useFilters = (level: Level) => {
  const search = useSearch({ from: '/$locale/admin/projects/' });
  const facets = useFacets(level);

  const offered = (key: FacetKey) => facets.includes(key);
  const participationStates = offered('participation_states')
    ? toStateChoices(search.participation_states ?? [])
    : undefined;
  const valuesOf = (key: ListFacetKey): readonly string[] => {
    if (key === 'participation_states') return participationStates ?? [];
    return (offered(key) && search[key]) || [];
  };
  const minStartDate = offered('start_date')
    ? search.min_start_date
    : undefined;
  const maxStartDate = offered('start_date')
    ? search.max_start_date
    : undefined;

  const activeFacets = facets.filter((key) =>
    isListFacet(key)
      ? valuesOf(key).length > 0
      : !!(minStartDate || maxStartDate)
  );
  const searchTerm = search.search?.trim();

  // What the projects request takes, leaving out the filters this level
  // doesn't offer, should the URL still have them.
  const queryParams = {
    search: searchTerm || undefined,
    managers: offered('managers') ? search.managers : undefined,
    display_status: offered('display_status')
      ? search.display_status
      : undefined,
    folder_ids: offered('folder_ids') ? search.folder_ids : undefined,
    participation_states: participationStates,
    participation_methods: offered('participation_methods')
      ? search.participation_methods
      : undefined,
    visibility: offered('visibility') ? search.visibility : undefined,
    discoverability: offered('discoverability')
      ? search.discoverability
      : undefined,
    space_ids: offered('space_ids') ? search.space_ids : undefined,
    min_start_date: minStartDate,
    max_start_date: maxStartDate,
  };

  const setValues = (key: ListFacetKey, values: string[]) => {
    updateSearchParams({ [key]: values.length > 0 ? values : undefined });
  };

  const setDates = (from?: string, to?: string) => {
    updateSearchParams({ min_start_date: from, max_start_date: to });
  };

  const removeFacet = (key: FacetKey) => {
    removeSearchParams(isListFacet(key) ? [key] : DATE_PARAMS);
  };

  const clearFilters = () => {
    removeSearchParams([...facetKeys.filter(isListFacet), ...DATE_PARAMS]);
  };

  return {
    facets,
    activeFacets,
    valuesOf,
    minStartDate,
    maxStartDate,
    searchTerm,
    isNarrowed: !!searchTerm || activeFacets.length > 0,
    queryParams,
    setValues,
    setDates,
    removeFacet,
    clearFilters,
  };
};

export default useFilters;
