import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { CLErrors } from 'typings';

import analyticsKeys from 'api/analytics/keys';
import ideaImagesKeys from 'api/idea_images/keys';
import ideaMarkersKeys from 'api/idea_markers/keys';
import ideaFilterCountsKeys from 'api/ideas_filter_counts/keys';
import { importedIdeasKeys } from 'api/import_ideas/keys';
import meKeys from 'api/me/keys';
import { invalidateProjectPhases } from 'api/phases/invalidateProjectPhases';
import projectsKeys from 'api/projects/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import ideasKeys from './keys';
import { IIdea, IIdeaUpdate } from './types';

export type IUpdateIdeaObject = {
  id: string;
  requestBody: IIdeaUpdate;
  skipRefetchCounts?: boolean; // Variable so we don't invalidate cache unnecessarily
};

export const updateIdea = ({ id, requestBody }: IUpdateIdeaObject) =>
  fetcher<IIdea>({
    path: `/ideas/${id}`,
    action: 'patch',
    body: { idea: requestBody },
  });

// Shared with batch updates, which refresh once for the whole batch.
export const invalidateAfterIdeaUpdate = (
  queryClient: QueryClient,
  ideas: IIdea[],
  {
    skipRefetchCounts = false,
    published = false,
  }: { skipRefetchCounts?: boolean; published?: boolean } = {}
) => {
  queryClient.invalidateQueries({ queryKey: ideasKeys.lists() });
  queryClient.invalidateQueries({ queryKey: ideaMarkersKeys.lists() });

  if (!skipRefetchCounts) {
    queryClient.invalidateQueries({ queryKey: ideaFilterCountsKeys.all() });
    queryClient.invalidateQueries({
      queryKey: ideaFilterCountsKeys.items(),
    });
  }

  ideas.forEach((idea) =>
    queryClient.invalidateQueries({
      queryKey: ideaImagesKeys.list({ ideaId: idea.data.id }),
    })
  );
  queryClient.invalidateQueries({
    queryKey: ideaImagesKeys.items(),
  });
  queryClient.invalidateQueries({
    queryKey: meKeys.all(),
  });

  const projectIds = new Set(
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    ideas.map((idea) => idea.data.relationships?.project.data.id)
  );

  projectIds.forEach((projectId) => {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!projectId) return;

    queryClient.invalidateQueries({
      queryKey: projectsKeys.item({ id: projectId }),
    });

    if (published) {
      invalidateProjectPhases(queryClient, projectId);
    }

    queryClient.invalidateQueries({
      queryKey: importedIdeasKeys.list({ projectId }),
    });
  });
  queryClient.invalidateQueries({
    queryKey: analyticsKeys.all(),
  });
};

const useUpdateIdea = () => {
  const queryClient = useQueryClient();
  return useMutation<IIdea, CLErrors, IUpdateIdeaObject>({
    mutationFn: updateIdea,
    onSuccess: (idea, variables) => {
      invalidateAfterIdeaUpdate(queryClient, [idea], {
        skipRefetchCounts: variables.skipRefetchCounts,
        published: variables.requestBody.publication_status === 'published',
      });
    },
  });
};

export default useUpdateIdea;
