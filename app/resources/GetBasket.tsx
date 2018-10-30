import React from 'react';
import { isBoolean, isString } from 'lodash-es';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { basketByIdStream, IBasketData } from 'services/baskets';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  id: string;
}

type children = (renderProps: GetBasketChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
  cache?: boolean;
}

interface State {
  basket: IBasketData | undefined | null | Error;
}

export type GetBasketChildProps = IBasketData | undefined | null | Error;

export default class GetBasket extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      basket: undefined
    };
  }

  componentDidMount() {
    const { id } = this.props;
    const cacheStream = (isBoolean(this.props.cache) ? this.props.cache : true);

    this.inputProps$ = new BehaviorSubject({ id });

    this.subscriptions = [
      this.inputProps$.pipe(
        distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
        filter(({ id }) => isString(id)),
        switchMap(({ id }) => basketByIdStream(id, { cacheStream }).observable)
      )
      .subscribe((basket) => this.setState({ basket: !isNilOrError(basket) ? basket.data : basket }))
    ];
  }

  componentDidUpdate() {
    const { id } = this.props;
    this.inputProps$.next({ id });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { basket } = this.state;
    return (children as children)(basket);
  }
}
