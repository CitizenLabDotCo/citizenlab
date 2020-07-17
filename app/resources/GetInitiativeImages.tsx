import React from 'react';
import { BehaviorSubject, Subscription, of } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import {
  IInitiativeImageData,
  initiativeImagesStream,
} from 'services/initiativeImages';
import { isString } from 'lodash-es';

interface InputProps {
  initiativeId: string | null;
}

type children = (
  renderProps: GetInitiativeImagesChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  initiativeImages: IInitiativeImageData[] | undefined | null;
}

export type GetInitiativeImagesChildProps =
  | IInitiativeImageData[]
  | undefined
  | null;

export default class GetInitiativeImages extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      initiativeImages: undefined,
    };
  }

  componentDidMount() {
    const { initiativeId } = this.props;

    this.inputProps$ = new BehaviorSubject({ initiativeId });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          switchMap(({ initiativeId }) => {
            if (isString(initiativeId)) {
              return initiativeImagesStream(initiativeId).observable;
            }

            return of(null);
          })
        )
        .subscribe((initiativeImages) => {
          this.setState({
            initiativeImages: initiativeImages ? initiativeImages.data : null,
          });
        }),
    ];
  }

  componentDidUpdate() {
    const { initiativeId } = this.props;
    this.inputProps$.next({ initiativeId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { initiativeImages } = this.state;
    return (children as children)(initiativeImages);
  }
}
