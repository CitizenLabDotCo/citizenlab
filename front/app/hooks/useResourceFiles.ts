import { useState, useEffect } from 'react';
import { Observable, of } from 'rxjs';
import {
  ResourceType,
  IResourceFileData,
  IResourceFiles,
} from 'resources/GetResourceFiles';
import { isNilOrError } from 'utils/helperUtils';

import { projectFilesStream } from 'services/projectFiles';
import { phaseFilesStream } from 'services/phaseFiles';
import { eventFilesStream } from 'services/eventFiles';
import { pageFilesStream } from 'services/pageFiles';
import { ideaFilesStream } from 'services/ideaFiles';
import { initiativeFilesStream } from 'services/initiativeFiles';

interface Props {
  resourceId: string | null;
  resourceType: ResourceType;
}

function getResourceStream(resourceType: ResourceType) {
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
}

export default function useResourceFiles({ resourceId, resourceType }: Props) {
  const [files, setFiles] = useState<
    IResourceFileData[] | undefined | null | Error
  >(undefined);
  const stream = getResourceStream(resourceType);

  useEffect(() => {
    let observable: Observable<IResourceFiles | null> = of(null);

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
