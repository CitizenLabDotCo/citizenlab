import React from 'react';
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
import { pageFilesStream, ICustomPageFiles } from 'services/pageFiles';
import { eventFilesStream, IEventFiles } from 'services/eventFiles';
import { ideaFilesStream, IIdeaFiles } from 'services/ideaFiles';
import {
  initiativeFilesStream,
  IInitiativeFiles,
} from 'services/initiativeFiles';
import { convertUrlToUploadFileObservable } from 'utils/fileUtils';
import { UploadFile } from 'typings';

// Converted file objects (to JS objects of type File).
// Useful when you combining local files and remote files,
// so you don't have to convert (file uploader)

export type TResourceType =
  | 'project'
  | 'phase'
  | 'event'
  | 'page'
  | 'idea'
  | 'initiative';

export interface InputProps {
  resetOnChange?: boolean;
  resourceType: TResourceType;
  resourceId: string | null;
}

type Children = (renderProps: GetRemoteFilesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: Children;
}

interface State {
  files: UploadFile[] | undefined | null | Error;
}

export type GetRemoteFilesChildProps = State['files'];

export default class GetRemoteFiles extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  public static defaultProps = {
    resetOnChange: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      files: undefined,
    };
  }

  componentDidMount() {
    const { resourceId, resourceType, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ resourceId, resourceType });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          tap(() => resetOnChange && this.setState({ files: undefined })),
          filter(({ resourceId }) => isString(resourceId)),
          switchMap(
            ({
              resourceId,
              resourceType,
            }: {
              resourceId: string;
              resourceType: TResourceType;
            }) => {
              let streamFn;
              if (resourceType === 'project') {
                streamFn = projectFilesStream;
              }
              if (resourceType === 'phase') {
                streamFn = phaseFilesStream;
              }
              if (resourceType === 'event') {
                streamFn = eventFilesStream;
              }
              if (resourceType === 'page') {
                streamFn = pageFilesStream;
              }
              if (resourceType === 'idea') {
                streamFn = ideaFilesStream;
              }
              if (resourceType === 'initiative') {
                streamFn = initiativeFilesStream;
              }

              return streamFn(resourceId).observable as Observable<
                | IProjectFiles
                | IPhaseFiles
                | IEventFiles
                | ICustomPageFiles
                | IIdeaFiles
                | IInitiativeFiles
                | null
              >;
            }
          ),
          switchMap((files) => {
            if (files && files.data && files.data.length > 0) {
              return combineLatest(
                files.data.map((file) =>
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
        )
        .subscribe((files) => {
          this.setState({
            files: files
              ? (files.filter((file) => !isNilOrError(file)) as UploadFile[])
              : null,
          });
        }),
    ];
  }

  componentDidUpdate() {
    const { resourceId, resourceType, resetOnChange } = this.props;
    this.inputProps$.next({ resourceId, resourceType, resetOnChange });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { files } = this.state;
    return (children as Children)(files);
  }
}
