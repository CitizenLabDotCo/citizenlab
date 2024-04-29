import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import useProjectById from 'api/projects/useProjectById';

import fetcher from 'utils/cl-react-query/fetcher';

import projectDescriptionBuilderKeys from './keys';
import {
  IProjectDescriptionBuilderLayout,
  ProjectDescriptionBuilderKeys,
} from './types';

const fetchProjectDescriptionBuilderLayout = (projectId: string) => {
  return fetcher<IProjectDescriptionBuilderLayout>({
    path: `/projects/${projectId}/content_builder_layouts/project_description`,
    action: 'get',
  });
};

const useProjectDescriptionBuilderLayout = (projectId: string) => {
  const { data: project } = useProjectById(projectId);

  const result = useQuery<
    IProjectDescriptionBuilderLayout,
    CLErrors,
    IProjectDescriptionBuilderLayout,
    ProjectDescriptionBuilderKeys
  >({
    queryKey: projectDescriptionBuilderKeys.item({ projectId }),
    queryFn: () => fetchProjectDescriptionBuilderLayout(projectId),
    enabled: !!project && project.data.attributes.uses_content_builder,
  });

  useEffect(() => {
    if (project && project.data.attributes.uses_content_builder) {
      result.refetch();
    }
  }, [project, result]);

  return result;
};

export default useProjectDescriptionBuilderLayout;
