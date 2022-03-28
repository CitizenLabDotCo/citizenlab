import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { Observable, of } from 'rxjs';
import {
  BuilderContentStream,
  IContentLayoutData,
  IContentLayout,
} from '../services/ContentBuilder';

interface Props {
  projectId?: string;
  code?: string;
}

export default function useBuilderLayout({ projectId, code }: Props) {
  const [builderLayout, setBuilderLayout] = useState<
    IContentLayoutData | undefined | null
  >();

  useEffect(() => {
    setBuilderLayout(undefined);
    let observable: Observable<IContentLayout | null> = of(null);

    if (projectId !== undefined && code !== undefined) {
      observable = BuilderContentStream(projectId, code).observable;
    }

    const subscription = observable.subscribe((response) => {
      if (isNilOrError(response)) {
        setBuilderLayout(response);
        return;
      }
      setBuilderLayout(response.data);
    });

    return () => subscription.unsubscribe();
  }, [projectId, code]);

  return builderLayout;
}
