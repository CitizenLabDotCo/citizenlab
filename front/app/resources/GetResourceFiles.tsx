import React from 'react';
import { isString } from 'lodash-es';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, switchMap, tap, filter } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
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
import { IIdeaFileData, IIdeaFiles } from 'services/ideaFiles';

import { isNilOrError } from 'utils/helperUtils';

export type ResourceType = 'project' | 'phase' | 'page';

export type TResourceFileData =
  | IProjectFileData
  | IPhaseFileData
  | ICustomPageFileData
  | IIdeaFileData;

export type TResourceFiles =
  | IProjectFiles
  | IPhaseFiles
  | ICustomPageFiles
  | IIdeaFiles;

interface InputProps {
  resetOnChange?: boolean;
  resourceType: ResourceType;
  resourceId: string | null;
}

type Children = (renderProps: GetResourceFilesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: Children;
}

interface State {
  files: TResourceFileData[] | undefined | null | Error;
}

export type GetResourceFilesChildProps = State['files'];

export default class GetResourceFiles extends React.Component<Props, State> {
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
              resourceType: InputProps['resourceType'];
            }) => {
              let streamFn;
              if (resourceType === 'project') {
                streamFn = projectFilesStream;
              }
              if (resourceType === 'phase') {
                streamFn = phaseFilesStream;
              }
              if (resourceType === 'page') {
                streamFn = pageFilesStream;
              }

              return streamFn(resourceId)
                .observable as Observable<TResourceFiles | null>;
            }
          )
        )
        .subscribe((files) => {
          this.setState({ files: !isNilOrError(files) ? files.data : files });
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
