import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { IIdeaImageData, ideaImagesStream } from 'services/ideaImages';
import { isString } from 'lodash';

interface InputProps {
  ideaId: string | null;
}

type children = (renderProps: GetIdeaImagesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  ideaImages: IIdeaImageData[] | null;
}

export type GetIdeaImagesChildProps = IIdeaImageData[] | null;

export default class GetIdea extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      ideaImages: null
    };
  }

  componentDidMount() {
    const { ideaId } = this.props;

    this.inputProps$ = new BehaviorSubject({ ideaId });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .filter(({ ideaId }) => isString(ideaId))
        .switchMap(({ ideaId }: {ideaId: string}) => ideaImagesStream(ideaId).observable)
        .subscribe((ideaImages) => {
          this.setState({ ideaImages: (ideaImages ? ideaImages.data : null) });
        })
    ];
  }

  componentDidUpdate() {
    const { ideaId } = this.props;
    this.inputProps$.next({ ideaId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { ideaImages } = this.state;
    return (children as children)(ideaImages);
  }
}
