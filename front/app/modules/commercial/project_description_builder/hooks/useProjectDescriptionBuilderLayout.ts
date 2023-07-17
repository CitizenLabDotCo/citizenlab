import { useState, useEffect } from 'react';
import useProjectById from 'api/projects/useProjectById';
import {
  projectDescriptionBuilderLayoutStream,
  IProjectDescriptionBuilderLayout,
} from '../services/projectDescriptionBuilder';

const useProjectDescriptionBuilderLayout = (projectId: string) => {
  const { data: project } = useProjectById(projectId);
  const [projectDescriptionBuilderLayout, setProjectDescriptionBuilderLayout] =
    useState<IProjectDescriptionBuilderLayout | undefined | null | Error>(
      undefined
    );

  useEffect(() => {
    if (!project) return;

    if (!project.data.attributes.uses_content_builder) {
      setProjectDescriptionBuilderLayout(null);
      return;
    }

    const subscription = projectDescriptionBuilderLayoutStream(
      project.data.id
    ).observable.subscribe((contentBuilderLayout) => {
      setProjectDescriptionBuilderLayout(contentBuilderLayout);
    });

    return () => subscription.unsubscribe();
  }, [project]);

  return projectDescriptionBuilderLayout;
};

export default useProjectDescriptionBuilderLayout;
