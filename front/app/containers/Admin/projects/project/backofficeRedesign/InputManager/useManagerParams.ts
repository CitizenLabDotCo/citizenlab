import { useCallback, useMemo } from 'react';

import { ideaSortValues, IIdeaQueryParameters, Sort } from 'api/ideas/types';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { useSearch } from 'utils/router';

export type ReplyFilter = 'awaiting' | 'replied';
export type SourceFilter = 'online' | 'imported';

export const isReplyFilter = (value: unknown): value is ReplyFilter =>
  value === 'awaiting' || value === 'replied';

export const isSourceFilter = (value: unknown): value is SourceFilter =>
  value === 'online' || value === 'imported';

export interface ManagerFilters {
  statuses: string[];
  /** User ids, and `unassigned` for inputs without an assignee. */
  assignees: string[];
  topics: string[];
  reply?: ReplyFilter;
  source?: SourceFilter;
  /** The phase whose inputs are listed. Undefined lists all phases. */
  phase?: string;
}

export const DEFAULT_SORT: Sort = 'new';

// Other routes type some of these params as lists, so both shapes are read.
const list = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value : value?.split(',') ?? []).filter(Boolean);

const joined = (values: string[]) =>
  values.length > 0 ? values.join(',') : undefined;

// State lives in the url, so a filtered list can be shared and notification
// emails can link straight to one input.
const useManagerParams = (phaseId: string) => {
  const search = useSearch({ strict: false });

  const filters: ManagerFilters = useMemo(
    () => ({
      statuses: list(search.status),
      assignees: list(search.assignee),
      topics: list(search.topics),
      reply:
        search.feedback_needed === 'true'
          ? 'awaiting'
          : search.feedback_needed === 'false'
          ? 'replied'
          : undefined,
      source: isSourceFilter(search.source) ? search.source : undefined,
      phase: search.phase === 'all' ? undefined : search.phase || phaseId,
    }),
    [search, phaseId]
  );

  const page = Math.max(1, parseInt(search.page ?? '1', 10) || 1);
  const sort: Sort =
    ideaSortValues.find((value) => value === search.sort) ?? DEFAULT_SORT;
  const searchTerm = search.search;
  const selectedIdeaId = search.selected_idea_id;

  const queryParameters: IIdeaQueryParameters<string[]> = useMemo(
    () => ({
      idea_status: filters.statuses,
      assignee: filters.assignees,
      input_topics: filters.topics,
      feedback_needed: filters.reply ? filters.reply === 'awaiting' : undefined,
      imported: filters.source ? filters.source === 'imported' : undefined,
      phase: filters.phase,
      search: searchTerm,
      sort,
    }),
    [filters, searchTerm, sort]
  );

  const setFilters = useCallback(
    (changes: Partial<ManagerFilters>) => {
      const updates: Record<string, string | undefined> = { page: undefined };

      if ('statuses' in changes) {
        updates.status = joined(changes.statuses ?? []);
      }
      if ('assignees' in changes) {
        updates.assignee = joined(changes.assignees ?? []);
      }
      if ('topics' in changes) updates.topics = joined(changes.topics ?? []);
      if ('reply' in changes) {
        updates.feedback_needed = changes.reply
          ? String(changes.reply === 'awaiting')
          : undefined;
      }
      if ('source' in changes) updates.source = changes.source;
      if ('phase' in changes) {
        updates.phase =
          changes.phase === undefined
            ? 'all'
            : changes.phase === phaseId
            ? undefined
            : changes.phase;
      }

      updateSearchParams(updates);
    },
    [phaseId]
  );

  const clearFilters = useCallback(() => {
    updateSearchParams({
      page: undefined,
      status: undefined,
      assignee: undefined,
      topics: undefined,
      feedback_needed: undefined,
      source: undefined,
      phase: undefined,
      search: undefined,
    });
  }, []);

  const setSort = useCallback((sort: Sort) => {
    updateSearchParams({
      page: undefined,
      sort: sort === DEFAULT_SORT ? undefined : sort,
    });
  }, []);

  const setPage = useCallback((page: number) => {
    updateSearchParams({ page: page > 1 ? String(page) : undefined });
  }, []);

  const setSearchTerm = useCallback((term: string | null) => {
    updateSearchParams({ page: undefined, search: term || undefined });
  }, []);

  const setSelectedIdeaId = useCallback((ideaId: string | undefined) => {
    updateSearchParams({ selected_idea_id: ideaId });
  }, []);

  return {
    filters,
    queryParameters,
    page,
    sort,
    searchTerm,
    selectedIdeaId,
    setFilters,
    clearFilters,
    setSort,
    setPage,
    setSearchTerm,
    setSelectedIdeaId,
  };
};

export default useManagerParams;
