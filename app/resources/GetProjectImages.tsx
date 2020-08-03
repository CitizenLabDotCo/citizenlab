import React from 'react';
import { isString } from 'lodash-es';
import { Subscription, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, switchMap, tap, filter } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { IProjectImageData, projectImagesStream } from 'services/projectImages';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  projectId: string | null;
  resetOnChange?: boolean;
}

type children = (renderProps: GetProjectImagesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  projectImages: IProjectImageData[] | undefined | null | Error;
}

export type GetProjectImagesChildProps =
  | IProjectImageData[]
  | undefined
  | null
  | Error;

export default class GetProjectImages extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  static defaultProps = {
    resetOnChange: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      projectImages: undefined,
    };
  }

  componentDidMount() {
    const { projectId, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ projectId });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          tap(
            () => resetOnChange && this.setState({ projectImages: undefined })
          ),
          filter(({ projectId }) => isString(projectId)),
          switchMap(
            ({ projectId }: { projectId: string }) =>
              projectImagesStream(projectId).observable
          )
        )
        .subscribe((projectImages) => {
          this.setState({
            projectImages: !isNilOrError(projectImages)
              ? projectImages.data
              : projectImages,
          });
        }),
    ];
  }

  componentDidUpdate() {
    const { projectId, resetOnChange } = this.props;
    this.inputProps$.next({ projectId, resetOnChange });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { projectImages } = this.state;
    return (children as children)(projectImages);
  }
}
