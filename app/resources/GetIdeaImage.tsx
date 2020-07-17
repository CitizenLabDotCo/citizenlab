import React from 'react';
import { BehaviorSubject, Subscription, of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { IIdeaImageData, ideaImageStream } from 'services/ideaImages';
import { isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  ideaId: string | null | undefined;
  ideaImageId: string | null | undefined;
  resetOnChange?: boolean;
}

type children = (renderProps: GetIdeaImageChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  ideaImage: IIdeaImageData | undefined | null;
}

export type GetIdeaImageChildProps = IIdeaImageData | undefined | null;

export default class GetIdeaImage extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  static defaultProps = {
    resetOnChange: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      ideaImage: undefined,
    };
  }

  componentDidMount() {
    const { ideaId, ideaImageId, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ ideaId, ideaImageId });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          tap(() => resetOnChange && this.setState({ ideaImage: undefined })),
          switchMap(({ ideaId, ideaImageId }) => {
            if (isString(ideaId) && isString(ideaImageId)) {
              return ideaImageStream(ideaId, ideaImageId).observable;
            }

            return of(null);
          })
        )
        .subscribe((ideaImage) =>
          this.setState({
            ideaImage: !isNilOrError(ideaImage) ? ideaImage.data : ideaImage,
          })
        ),
    ];
  }

  componentDidUpdate() {
    const { ideaId, ideaImageId } = this.props;
    this.inputProps$.next({ ideaId, ideaImageId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { ideaImage } = this.state;
    return (children as children)(ideaImage);
  }
}
