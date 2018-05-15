import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { IIdeaImageData, ideaImageStream } from 'services/ideaImages';
import { isString } from 'lodash';

interface InputProps {
  ideaId: string | null;
  ideaImageId: string | null;
}

type children = (renderProps: GetIdeaImageChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  ideaImage: IIdeaImageData | undefined| null;
}

export type GetIdeaImageChildProps = IIdeaImageData | undefined| null;

export default class GetIdeaImage extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      ideaImage: undefined
    };
  }

  componentDidMount() {
    const { ideaId, ideaImageId } = this.props;

    this.inputProps$ = new BehaviorSubject({ ideaId, ideaImageId });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .filter(({ ideaId, ideaImageId }) => isString(ideaId) && isString(ideaImageId))
        .switchMap(({ ideaId, ideaImageId }: { ideaId: string, ideaImageId: string }) => ideaImageStream(ideaId, ideaImageId).observable)
        .subscribe((ideaImage) => this.setState({ ideaImage: ideaImage.data }))
    ];
  }

  componentDidUpdate() {
    const { ideaId, ideaImageId } = this.props;
    this.inputProps$.next({ ideaId, ideaImageId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { ideaImage } = this.state;
    return (children as children)(ideaImage);
  }
}
