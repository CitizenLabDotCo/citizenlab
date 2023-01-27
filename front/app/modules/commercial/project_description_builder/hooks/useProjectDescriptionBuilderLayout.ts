import { useState, useEffect } from 'react';
import {
  projectDescriptionBuilderLayoutStream,
  IContentBuilderLayout,
} from '../services/projectDescriptionBuilder';

const useProjectDescriptionBuilderLayout = (projectId: string) => {
  const [projectDescriptionBuilderLayout, setProjectDescriptionBuilderLayout] =
    useState<IContentBuilderLayout | undefined | null | Error>(undefined);

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
