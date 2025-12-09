import { useMutation } from '@tanstack/react-query';
import { Multiloc } from 'typings';

import adminPublicationsKeys from 'api/admin_publications/keys';
import meKeys from 'api/me/keys';
import projectsKeys from 'api/projects/keys';

import { queryClient } from 'utils/cl-react-query/queryClient';

import { graphqlFetcher } from '../../utils/graphqlFetcher';

interface ApplyProjectTemplateVariables {
  projectTemplateId: string;
  titleMultiloc: Multiloc;
  timelineStartAt?: string;
  folderId?: string | null;
}

const useApplyProjectTemplate = () => {
  const APPLY_PROJECT_TEMPLATE_MUTATION = `
    mutation ApplyProjectTemplate(
      $projectTemplateId: ID!
      $titleMultiloc: MultilocAttributes!
      $timelineStartAt: String
      $folderId: String
    ) {
      applyProjectTemplate(
        projectTemplateId: $projectTemplateId
        titleMultiloc: $titleMultiloc
        timelineStartAt: $timelineStartAt
        folderId: $folderId
      ) {
        errors
      }
    }
  `;

  return useMutation({
    mutationFn: (variables: ApplyProjectTemplateVariables) =>
      graphqlFetcher({
        query: APPLY_PROJECT_TEMPLATE_MUTATION,
        variables,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: adminPublicationsKeys.lists(),
      });
      queryClient.invalidateQueries({ queryKey: meKeys.all() });
    },
  });
};

export default useApplyProjectTemplate;
