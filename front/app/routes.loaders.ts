import { contentBuilderLayoutOptions } from 'api/content_builder/useContentBuilderLayout';
import { eventsOptions } from 'api/events/useEvents';
import { ideaBySlugOptions } from 'api/ideas/useIdeaBySlug';
import { phasesOptions } from 'api/phases/usePhases';
import { projectPageLayoutOptions } from 'api/project_page_layout/useProjectPageLayout';
import { FinishedOrArchived, Parameters } from 'api/projects_mini/types';
import { projectsMiniOptions } from 'api/projects_mini/useProjectsMini';
import { projectByIdOptions } from 'api/projects/useProjectById';
import { projectBySlugOptions } from 'api/projects/useProjectBySlug';

import { CraftJson } from 'components/admin/ContentBuilder/typings';

import { queryClient } from 'utils/cl-react-query/queryClient';

/**
 * React Query records a rejection against the query key before this rejects, so
 * the components still read that error state and render their own
 * Unauthorized / PageNotFound. Letting the loader reject instead puts the match
 * in an error state, and since these routes declare no `errorComponent` it
 * bubbles to the global boundary and replaces the whole app shell.
 */
const swallow = <T>(promise: Promise<T>) => promise.catch(() => undefined);

export const projectShowLoader = async (slug: string) => {
  const project = await swallow(
    queryClient.ensureQueryData(projectBySlugOptions(slug))
  );
  if (!project) return;

  const projectId = project.data.id;

  // Only the project id is needed for these three, so they are siblings rather
  // than a chain. `useProjectById` is deliberately absent: the by_slug response
  // already writes the project under its item key via fetcher's
  // cacheIndividualItems, so requesting it again costs a round trip for nothing.
  await Promise.all([
    swallow(queryClient.ensureQueryData(phasesOptions(projectId))),
    swallow(
      queryClient.ensureQueryData(
        eventsOptions({ projectIds: [projectId], sort: '-start_at' })
      )
    ),
    swallow(queryClient.ensureQueryData(projectPageLayoutOptions(projectId))),
  ]);
};

export const ideasShowLoader = async (slug: string) => {
  const idea = await swallow(
    queryClient.ensureQueryData(ideaBySlugOptions(slug))
  );
  if (!idea) return;

  // The idea payload carries the project id, so the project and its phases are
  // siblings. Fetching phases only after the project resolves would add a round
  // trip for an id we already hold.
  const projectId = idea.data.relationships.project.data.id;

  await Promise.all([
    swallow(queryClient.ensureQueryData(projectByIdOptions(projectId))),
    swallow(queryClient.ensureQueryData(phasesOptions(projectId))),
  ]);
};

const FINISHED_OR_ARCHIVED_FILTERS: readonly FinishedOrArchived['filter_by'][] =
  ['finished', 'archived', 'finished_and_archived'];

const isFinishedOrArchivedFilter = (
  value: unknown
): value is FinishedOrArchived['filter_by'] =>
  FINISHED_OR_ARCHIVED_FILTERS.some((filter) => filter === value);

const prefetchProjectsMini = (parameters: Parameters) =>
  swallow(queryClient.prefetchInfiniteQuery(projectsMiniOptions(parameters)));

/**
 * Widget data normally waits for the layout response to be deserialized into
 * craft nodes and for those nodes to mount. The stored layout already names
 * every widget on the page, so it can be read here and the widget queries
 * started in the same tick as the layout resolving.
 */
const prefetchHomeWidgets = (craftJson: CraftJson) =>
  Object.values(craftJson).flatMap((node) => {
    const name =
      typeof node.type === 'string' ? node.type : node.type.resolvedName;

    switch (name) {
      case 'OpenToParticipation':
        return prefetchProjectsMini({
          endpoint: 'with_active_participatory_phase',
        });
      case 'FollowedItems':
        return prefetchProjectsMini({ endpoint: 'for_followed_item' });
      case 'FinishedOrArchived':
        return isFinishedOrArchivedFilter(node.props.filterBy)
          ? prefetchProjectsMini({
              endpoint: 'finished_or_archived',
              filter_by: node.props.filterBy,
            })
          : [];
      case 'Areas':
        return prefetchProjectsMini({ endpoint: 'for_areas' });
      default:
        return [];
    }
  });

export const homeLoader = async () => {
  const layout = await swallow(
    queryClient.ensureQueryData(contentBuilderLayoutOptions('homepage'))
  );
  if (!layout) return;

  await Promise.all(prefetchHomeWidgets(layout.data.attributes.craftjs_json));
};
