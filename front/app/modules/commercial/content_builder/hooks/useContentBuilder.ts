import { useState, useEffect } from 'react';
import {
  BuilderLayoutStream,
  IBuilderLayout,
} from '../services/ContentBuilder';

const useBuilderLayout = (id: string, code: string) => {
  const [builderLayout, setBuilderLayout] = useState<
    IBuilderLayout | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = BuilderLayoutStream(id, code).observable.subscribe(
      (builderLayout) => {
        setBuilderLayout(builderLayout);
      }
    );

    return () => subscription.unsubscribe();
  }, [id, code]);

  return builderLayout;
};

export default useBuilderLayout;
