import React from 'react';
import isString from 'lodash/isString';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { distinctUntilChanged, switchMap, tap, filter, combineLatest, map } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { projectFilesStream } from 'services/projectFiles';
import { phaseFilesStream } from 'services/phaseFiles';
import { convertUrlToUploadFileObservable } from 'utils/imageTools';
import { UploadFile } from 'typings';

interface InputProps {
  resetOnChange?: boolean;
  resourceType: 'project' | 'phase';
  resourceId: string | null;
}

type Children = (renderProps: GetResourceFilesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: Children;
}

interface State {
  files: UploadFile[] | undefined | null | Error;
}

export type GetResourceFilesChildProps = State['files'];

export default class GetResourceFiles extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  public static defaultProps: Partial<Props> = {
    resetOnChange: true
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      files: undefined
    };
  }

  componentDidMount() {
    const { resourceId, resourceType, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ resourceId, resourceType });

    this.subscriptions = [
      this.inputProps$.pipe(
        distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
        tap(() => resetOnChange && this.setState({ files: undefined })),
        filter(({ resourceId }) => isString(resourceId)),
        switchMap(({ resourceId, resourceType }: { resourceId: string, resourceType: InputProps['resourceType'] }) => {
          const streamFn = (resourceType === 'project' ? projectFilesStream : phaseFilesStream);
          return streamFn(resourceId).observable;
        }),
        switchMap((files) => {
          if (files && files.data && files.data.length > 0) {
            return combineLatest(
              files.data.map(file => convertUrlToUploadFileObservable(file.attributes.file.url).pipe(
                map(fileObj => {
                  fileObj['id'] = file.id;
                  return fileObj;
                })
              ))
            );
          }

          return of(files) as Observable<any>;
        })
      )
      .subscribe((files: UploadFile[] | null | Error) => {
        this.setState({ files });
      })
    ];
  }

  componentDidUpdate() {
    const { resourceId, resourceType, resetOnChange } = this.props;
    this.inputProps$.next({ resourceId, resourceType,  resetOnChange });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { files } = this.state;
    return (children as Children)(files);
  }
}
