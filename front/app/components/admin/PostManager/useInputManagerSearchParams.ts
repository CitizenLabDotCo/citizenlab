import { useCallback, useMemo } from 'react';

import { useSearchParams } from 'react-router-dom';

import { IIdeaQueryParameters, Sort } from 'api/ideas/types';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import { TFilterMenu } from '.';

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
  const [searchParams] = useSearchParams();

  const params: Params = useMemo(() => {
    const getParam = (name: string) => searchParams.get(name) || undefined;

    const topicsRaw = searchParams.get('topics');
    const inputTopics = topicsRaw ? topicsRaw.split(',') : undefined;

    const projectsRaw = searchParams.get('projects');
    const projectsFromUrl = projectsRaw ? projectsRaw.split(',') : undefined;
    const defaultProjects = context.projectId ? [context.projectId] : undefined;
    const projects = projectsFromUrl ?? defaultProjects;

    const pageRaw = searchParams.get('page');
    const page = pageRaw
      ? Math.max(1, parseInt(pageRaw, 10)) || undefined // avoid NaNs
      : undefined;

    return {
      projects,
      input_topics: inputTopics,
      feedback_needed: boolean(getParam('feedback_needed')),
      phase: getParam('phase') || context.phaseId,
      sort: (getParam('sort') || 'new') as Sort,
      tab: getParam('tab') as TFilterMenu | undefined,
      search: getParam('search'),
      idea_status: getParam('status'),
      assignee: getParam('assignee'),
      selected_idea_id: getParam('selected_idea_id'),
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
        if (newParams.phase && newParams.phase !== context.phaseId) {
          toUpdate.phase = newParams.phase;
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

function boolean(string: string | null | undefined) {
  if (string?.toLowerCase() === 'true') return true;
  if (string?.toLowerCase() === 'false') return false;
  return undefined;
}

export default useInputManagerSearchParams;
