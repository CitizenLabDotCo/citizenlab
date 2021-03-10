import React from 'react';
import { isString } from 'lodash-es';
import { BehaviorSubject, Subscription, of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { basketByIdStream, IBasketData } from 'services/baskets';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  id: string | null | undefined;
  resetOnChange?: boolean;
}

type children = (renderProps: GetBasketChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  basket: IBasketData | undefined | null | Error;
}

export type GetBasketChildProps = IBasketData | undefined | null | Error;

export default class GetBasket extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  static defaultProps = {
    resetOnChange: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      basket: undefined,
    };
  }

  componentDidMount() {
    const { id, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ id });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          tap(() => resetOnChange && this.setState({ basket: undefined })),
          switchMap(({ id }) => {
            if (isString(id)) {
              return basketByIdStream(id).observable;
            }

            return of(null);
          })
        )
        .subscribe((basket) =>
          this.setState({
            basket: !isNilOrError(basket) ? basket.data : basket,
          })
        ),
    ];
  }

  componentDidUpdate() {
    const { id } = this.props;
    this.inputProps$.next({ id });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { basket } = this.state;
    return (children as children)(basket);
  }
}
