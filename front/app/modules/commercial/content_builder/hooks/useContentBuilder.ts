import { useState, useEffect } from 'react';
import {
  contentBuilderLayoutStream,
  IContentBuilderLayout,
} from '../services/ContentBuilder';

const useContentBuilderLayout = (id: string, code: string) => {
  const [contentBuilderLayout, setContentBuilderLayout] = useState<
    IContentBuilderLayout | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = contentBuilderLayoutStream(
      id,
      code
    ).observable.subscribe((contentBuilderLayout) => {
      setContentBuilderLayout(contentBuilderLayout);
    });

    return () => subscription.unsubscribe();
  }, [id, code]);

  return contentBuilderLayout;
};

export default useContentBuilderLayout;
