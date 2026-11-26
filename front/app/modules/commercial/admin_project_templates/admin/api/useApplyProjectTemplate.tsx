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

interface ApplyProjectTemplateResponse {
  applyProjectTemplate: {
    errors: string[];
  };
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
    mutationFn: async (variables: ApplyProjectTemplateVariables) => {
      const data = await graphqlFetcher<ApplyProjectTemplateResponse>({
        query: APPLY_PROJECT_TEMPLATE_MUTATION,
        variables,
      });

      // A failed export or import is not a GraphQL error: the response is a
      // 200 with the reason in the payload's own `errors` field.
      const [error] = data.applyProjectTemplate.errors;
      if (error) {
        throw new Error(error);
      }

      return data;
    },
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
