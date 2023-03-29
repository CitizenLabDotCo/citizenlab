import { useState, useEffect } from 'react';
import { Observable, of } from 'rxjs';

import {
  projectFilesStream,
  IProjectFileData,
  IProjectFiles,
} from 'services/projectFiles';
import {
  phaseFilesStream,
  IPhaseFileData,
  IPhaseFiles,
} from 'services/phaseFiles';
import {
  pageFilesStream,
  ICustomPageFileData,
  ICustomPageFiles,
} from 'services/pageFiles';

import { isNilOrError } from 'utils/helperUtils';

export type ResourceType = 'project' | 'phase' | 'page';

export type TResourceFileData =
  | IProjectFileData
  | IPhaseFileData
  | ICustomPageFileData;

export type TResourceFiles = IProjectFiles | IPhaseFiles | ICustomPageFiles;

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
        case 'phase':
          return phaseFilesStream;
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
