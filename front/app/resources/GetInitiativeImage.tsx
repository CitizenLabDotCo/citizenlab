import React from 'react';
import { isString } from 'lodash-es';
import { BehaviorSubject, Subscription, of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import {
  IInitiativeImageData,
  initiativeImageStream,
} from 'services/initiativeImages';
import { isNilOrError } from 'utils/helperUtils';
import shallowCompare from 'utils/shallowCompare';

interface InputProps {
  initiativeId: string | null | undefined;
  initiativeImageId: string | null | undefined;
  resetOnChange?: boolean;
}

type children = (
  renderProps: GetInitiativeImageChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  initiativeImage: IInitiativeImageData | undefined | null;
}

export type GetInitiativeImageChildProps =
  | IInitiativeImageData
  | undefined
  | null;

export default class GetInitiativeImage extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  static defaultProps = {
    resetOnChange: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      initiativeImage: undefined,
    };
  }

  componentDidMount() {
    const { initiativeId, initiativeImageId, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ initiativeId, initiativeImageId });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          tap(
            () => resetOnChange && this.setState({ initiativeImage: undefined })
          ),
          switchMap(({ initiativeId, initiativeImageId }) => {
            if (isString(initiativeId) && isString(initiativeImageId)) {
              return initiativeImageStream(initiativeId, initiativeImageId)
                .observable;
            }

            return of(null);
          })
        )
        .subscribe((initiativeImage) =>
          this.setState({
            initiativeImage: !isNilOrError(initiativeImage)
              ? initiativeImage.data
              : initiativeImage,
          })
        ),
    ];
  }

  componentDidUpdate() {
    const { initiativeId, initiativeImageId } = this.props;
    this.inputProps$.next({ initiativeId, initiativeImageId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { initiativeImage } = this.state;
    return (children as children)(initiativeImage);
  }
}
