import { useCallback, useMemo } from 'react';

import { IIdeaQueryParameters, Sort } from 'api/ideas/types';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { useSearch } from 'utils/router';

import { TFilterMenu } from '.';

const filterMenuTabs = [
  'topics',
  'phases',
  'projects',
  'statuses',
] as const satisfies readonly TFilterMenu[];

type Params = IIdeaQueryParameters & {
  tab?: TFilterMenu;
  selected_idea_id?: string;
};

/**
 * Syncs InputManager filter state with URL search params.
 * This enables deep linking. For example, users can share or bookmark filtered
 * views, and emails can link straight to specific inputs.
 */
const useInputManagerSearchParams = (context: {
  projectId?: string | null;
  phaseId?: string;
}) => {
  const searchParams = useSearch({ strict: false });

  const params: Params = useMemo(() => {
    const topicsParam = searchParams.topics;
    const inputTopics = Array.isArray(topicsParam)
      ? topicsParam
      : topicsParam
      ? topicsParam.split(',')
      : undefined;

    const projectsParam = searchParams.projects;
    const projectsFromUrl = Array.isArray(projectsParam)
      ? projectsParam
      : projectsParam
      ? projectsParam.split(',')
      : undefined;
    const defaultProjects = context.projectId ? [context.projectId] : undefined;
    const projects = projectsFromUrl ?? defaultProjects;

    const page = searchParams.page
      ? Math.max(1, parseInt(searchParams.page, 10)) || undefined // avoid NaNs
      : undefined;

    const phaseParam = searchParams.phase;

    return {
      projects,
      input_topics: inputTopics,
      feedback_needed: boolean(searchParams.feedback_needed),
      phase: phaseParam === 'all' ? undefined : phaseParam || context.phaseId,
      sort: (searchParams.sort || 'new') as Sort,
      tab: filterMenuTabs.find((t) => t === searchParams.tab),
      search: searchParams.search,
      idea_status:
        typeof searchParams.status === 'string'
          ? searchParams.status
          : undefined,
      assignee: searchParams.assignee,
      selected_idea_id: searchParams.selected_idea_id,
      'page[number]': page,
    };
  }, [searchParams, context.projectId, context.phaseId]);

  const setParams = useCallback(
    (newParams: Partial<Params>) => {
      const toUpdate: Record<string, string> = {};
      const toRemove: string[] = [];

      if ('sort' in newParams) {
        if (newParams.sort && newParams.sort !== 'new') {
          toUpdate.sort = newParams.sort;
        } else {
          toRemove.push('sort');
        }
      }

      if ('page[number]' in newParams) {
        if (newParams['page[number]'] && newParams['page[number]'] > 1) {
          toUpdate.page = String(newParams['page[number]']);
        } else {
          toRemove.push('page');
        }
      }

      if ('search' in newParams) {
        if (newParams.search) {
          toUpdate.search = newParams.search;
        } else {
          toRemove.push('search');
        }
      }

      if ('idea_status' in newParams) {
        if (newParams.idea_status) {
          toUpdate.status = newParams.idea_status;
        } else {
          toRemove.push('status');
        }
      }

      if ('input_topics' in newParams) {
        if (newParams.input_topics && newParams.input_topics.length > 0) {
          toUpdate.topics = newParams.input_topics.join(',');
        } else {
          toRemove.push('topics');
        }
      }

      if ('assignee' in newParams) {
        if (newParams.assignee) {
          toUpdate.assignee = newParams.assignee;
        } else {
          toRemove.push('assignee');
        }
      }

      if ('feedback_needed' in newParams) {
        if (newParams.feedback_needed) {
          toUpdate.feedback_needed = 'true';
        } else {
          toRemove.push('feedback_needed');
        }
      }

      if ('phase' in newParams) {
        const phase = newParams.phase;
        if (!phase) {
          // "All phases" selected
          toUpdate.phase = 'all';
        } else if (phase !== context.phaseId) {
          toUpdate.phase = phase;
        } else {
          toRemove.push('phase');
        }
      }

      // Only for the global input manager
      if ('projects' in newParams && !context.projectId) {
        if (newParams.projects && newParams.projects.length > 0) {
          toUpdate.projects = newParams.projects.join(',');
        } else {
          toRemove.push('projects');
        }
      }

      if ('tab' in newParams) {
        if (newParams.tab) {
          toUpdate.tab = newParams.tab;
        } else {
          toRemove.push('tab');
        }
      }

      if ('selected_idea_id' in newParams) {
        if (newParams.selected_idea_id) {
          toUpdate.selected_idea_id = newParams.selected_idea_id;
        } else {
          toRemove.push('selected_idea_id');
        }
      }

      if (toRemove.length > 0) {
        removeSearchParams(toRemove);
      }

      if (Object.keys(toUpdate).length > 0) {
        updateSearchParams(toUpdate);
      }
    },
    [context.phaseId, context.projectId]
  );

  const resetParams = useCallback(() => {
    removeSearchParams([
      'sort',
      'page',
      'search',
      'status',
      'topics',
      'assignee',
      'feedback_needed',
      'phase',
      'projects',
      'tab',
      'selected_idea_id',
    ]);
  }, []);

  return { params, setParams, resetParams };
};

function boolean(value: unknown) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return undefined;
}

export default useInputManagerSearchParams;
