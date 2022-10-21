import { useEffect, useState } from 'react';
import {
  ResourceType,
  TResourceFileData,
  TResourceFiles,
} from 'resources/GetResourceFiles';
import { Observable, of } from 'rxjs';
import { isNilOrError } from 'utils/helperUtils';

import { eventFilesStream } from 'services/eventFiles';
import { ideaFilesStream } from 'services/ideaFiles';
import { initiativeFilesStream } from 'services/initiativeFiles';
import { pageFilesStream } from 'services/pageFiles';
import { phaseFilesStream } from 'services/phaseFiles';
import { projectFilesStream } from 'services/projectFiles';

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
        case 'event':
          return eventFilesStream;
        case 'page':
          return pageFilesStream;
        case 'idea':
          return ideaFilesStream;
        case 'initiative':
          return initiativeFilesStream;
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
