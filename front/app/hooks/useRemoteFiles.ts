import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { combineLatest, of, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { projectFilesStream } from 'services/projectFiles';
import { pageFilesStream } from 'services/pageFiles';
import { convertUrlToUploadFileObservable } from 'utils/fileUtils';
import { UploadFile } from 'typings';

export type TResourceType = 'project' | 'page';

export interface InputProps {
  resetOnChange?: boolean;
  resourceType: TResourceType;
  resourceId: string | null;
}

export type RemoteFiles = UploadFile[] | null;

function useRemoteFiles({
  resourceId,
  resourceType,
  resetOnChange = true,
}: InputProps) {
  const [remoteFiles, setRemoteFiles] = useState<RemoteFiles>(null);

  useEffect(() => {
    if (resetOnChange) {
      setRemoteFiles(null);
    }
    const streamFn = {
      project: projectFilesStream,
      page: pageFilesStream,
    }[resourceType];
    let observable: Observable<(UploadFile | null)[] | null> = of(null);

    if (resourceId) {
      observable = streamFn(resourceId).observable.pipe(
        switchMap((files) => {
          const filesData = files?.data;
          if (filesData && filesData.length > 0) {
            return combineLatest(
              filesData.map((file) =>
                convertUrlToUploadFileObservable(
                  file.attributes.file.url,
                  file.id,
                  file.attributes.name
                )
              )
            );
          }

          return of(null);
        })
      );
    }

    const subscription = observable.subscribe((files) => {
      setRemoteFiles(
        files
          ? (files.filter((file) => !isNilOrError(file)) as UploadFile[])
          : null
      );
    });

    return () => subscription.unsubscribe();
  }, [resourceType, resourceId, resetOnChange]);

  return remoteFiles;
}

export default useRemoteFiles;
