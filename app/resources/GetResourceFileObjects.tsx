import React from 'react';
import { isString } from 'lodash-es';
import { Subscription, BehaviorSubject, combineLatest, of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap, filter, map } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { projectFilesStream } from 'services/projectFiles';
import { phaseFilesStream } from 'services/phaseFiles';
import { convertUrlToUploadFileObservable } from 'utils/imageTools';
import { UploadFile } from 'typings';

// Converted file objects (to JS objects of type File).
// Useful when you combining local files and remote files,
// so you don't have to convert (file uploader)

interface InputProps {
  resetOnChange?: boolean;
  resourceType: 'project' | 'phase' | 'event';
  resourceId: string | null;
}

type Children = (renderProps: GetResourceFileObjectsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: Children;
}

interface State {
  files: UploadFile[] | undefined | null | Error;
}

export type GetResourceFileObjectsChildProps = State['files'];

export default class GetResourceFileObjects extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  public static defaultProps = {
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
                  fileObj['url'] = file.attributes.file.url;
                  return fileObj;
                })
              ))
            );
          }

          return of(null);
        })
      )
      .subscribe((files) => {
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
