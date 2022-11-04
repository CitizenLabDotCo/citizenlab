import { useState, useEffect } from 'react';
import {
  contentBuilderLayoutStream,
  IContentBuilderLayout,
} from '../services/contentBuilder';

// We will need a different hook- every report will have its own ID
const useContentBuilderLayout = ({ projectId, code }) => {
  const [contentBuilderLayout, setContentBuilderLayout] = useState<
    IContentBuilderLayout | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = contentBuilderLayoutStream({
      projectId,
      code,
    }).observable.subscribe((contentBuilderLayout) => {
      setContentBuilderLayout(contentBuilderLayout);
    });

    return () => subscription.unsubscribe();
  }, [projectId, code]);

  return contentBuilderLayout;
};

export default useContentBuilderLayout;
