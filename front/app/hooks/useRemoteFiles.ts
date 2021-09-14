import React, { useState, useEffect } from 'react';
import { isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import {
  Subscription,
  BehaviorSubject,
  combineLatest,
  of,
  Observable,
} from 'rxjs';
import { distinctUntilChanged, switchMap, tap, filter } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { projectFilesStream, IProjectFiles } from 'services/projectFiles';
import { phaseFilesStream, IPhaseFiles } from 'services/phaseFiles';
import { pageFilesStream, IPageFiles } from 'services/pageFiles';
import { eventFilesStream, IEventFiles } from 'services/eventFiles';
import { ideaFilesStream, IIdeaFiles } from 'services/ideaFiles';
import {
  initiativeFilesStream,
  IInitiativeFiles,
} from 'services/initiativeFiles';
import { convertUrlToUploadFileObservable } from 'utils/fileTools';
import { UploadFile } from 'typings';
import { TResourceType, InputProps } from 'resources/GetResourceFileObjects';

function useRemoteFiles({
  resourceId,
  resourceType,
  resetOnChange = true,
}: InputProps) {
  const [remoteFiles, setRemoteFiles] = useState<UploadFile[] | null>(null);

  useEffect(() => {
    if (resetOnChange) {
      setRemoteFiles(null);
    }
    const streamFn = {
      project: projectFilesStream,
      phase: phaseFilesStream,
      event: eventFilesStream,
      page: pageFilesStream,
      idea: ideaFilesStream,
      initiative: initiativeFilesStream,
    }[resourceType];
    let observable: Observable<
      | IProjectFiles
      | IPhaseFiles
      | IEventFiles
      | IPageFiles
      | IIdeaFiles
      | IInitiativeFiles
      | null
    > = of(null);

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
