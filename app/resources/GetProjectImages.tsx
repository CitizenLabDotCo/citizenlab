import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { IProjectImageData, projectImagesStream } from 'services/projectImages';
import { isString } from 'lodash';

interface InputProps {
  projectId: string | null;
  resetOnChange?: boolean;
}

type children = (renderProps: GetProjectImagesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  projectImages: IProjectImageData[] | null;
}

export type GetProjectImagesChildProps = IProjectImageData[] | null;

export default class GetIdea extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      projectImages: null
    };
  }

  componentDidMount() {
    const { projectId, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ projectId });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .do(() => resetOnChange && this.setState({ projectImages: null }))
        .filter(({ projectId }) => isString(projectId))
        .switchMap(({ projectId }: {projectId: string}) => projectImagesStream(projectId).observable)
        .subscribe((projectImages) => {
          this.setState({ projectImages: (projectImages ? projectImages.data : null) });
        })
    ];
  }

  componentDidUpdate() {
    const { projectId, resetOnChange } = this.props;
    this.inputProps$.next({ projectId, resetOnChange });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { projectImages } = this.state;
    return (children as children)(projectImages);
  }
}
