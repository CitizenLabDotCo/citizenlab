import { useState, useEffect } from 'react';
import { Observable, of } from 'rxjs';

import {
  projectFilesStream,
  IProjectFileData,
  IProjectFiles,
} from 'services/projectFiles';
import {
  pageFilesStream,
  ICustomPageFileData,
  ICustomPageFiles,
} from 'services/pageFiles';

import { isNilOrError } from 'utils/helperUtils';

export type ResourceType = 'project' | 'page';

export type TResourceFileData = IProjectFileData | ICustomPageFileData;

export type TResourceFiles = IProjectFiles | ICustomPageFiles;

interface Props {
  resourceId: string | null;
  resourceType: ResourceType;
}

export default function useResourceFiles({ resourceId, resourceType }: Props) {
  const [files, setFiles] = useState<
    TResourceFileData[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const getResourceStream = (resourceType: ResourceType) => {
      switch (resourceType) {
        case 'project':
          return projectFilesStream;
        case 'page':
          return pageFilesStream;
      }
    };
    const stream = getResourceStream(resourceType);
    let observable: Observable<TResourceFiles | null> = of(null);

    if (resourceId) {
      observable = stream(resourceId).observable;
    }

    const subscription = observable.subscribe((response) => {
      const files = !isNilOrError(response) ? response.data : response;
      setFiles(files);
    });

    return () => subscription.unsubscribe();
  }, [resourceId, resourceType]);

  return files;
}
