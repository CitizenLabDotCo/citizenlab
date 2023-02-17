import { useState, useEffect } from 'react';
import {
  projectDescriptionBuilderLayoutStream,
  IProjectDescriptionBuilderLayout,
} from '../services/projectDescriptionBuilder';

const useProjectDescriptionBuilderLayout = (projectId: string) => {
  const [projectDescriptionBuilderLayout, setProjectDescriptionBuilderLayout] =
    useState<IProjectDescriptionBuilderLayout | undefined | null | Error>(
      undefined
    );

  useEffect(() => {
    const subscription = projectDescriptionBuilderLayoutStream(
      projectId
    ).observable.subscribe((contentBuilderLayout) => {
      setProjectDescriptionBuilderLayout(contentBuilderLayout);
    });

    return () => subscription.unsubscribe();
  }, [projectId]);

  return projectDescriptionBuilderLayout;
};

export default useProjectDescriptionBuilderLayout;
