import { isString } from 'lodash-es';
import React from 'react';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ideaImagesStream, IIdeaImageData } from 'services/ideaImages';
import shallowCompare from 'utils/shallowCompare';

interface InputProps {
  ideaId: string | null;
}

type children = (renderProps: GetIdeaImagesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  ideaImages: IIdeaImageData[] | undefined | null;
}

export type GetIdeaImagesChildProps = IIdeaImageData[] | undefined | null;

export default class GetIdeaImages extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      ideaImages: undefined,
    };
  }

  componentDidMount() {
    const { ideaId } = this.props;

    this.inputProps$ = new BehaviorSubject({ ideaId });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          switchMap(({ ideaId }) => {
            if (isString(ideaId)) {
              return ideaImagesStream(ideaId).observable;
            }

            return of(null);
          })
        )
        .subscribe((ideaImages) => {
          this.setState({ ideaImages: ideaImages ? ideaImages.data : null });
        }),
    ];
  }

  componentDidUpdate() {
    const { ideaId } = this.props;
    this.inputProps$.next({ ideaId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { ideaImages } = this.state;
    return (children as children)(ideaImages);
  }
}
