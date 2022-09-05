// Libraries
import React from 'react';
import { Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { ideasCountForUser, commentsCountForUser } from 'services/stats';
import { isNilOrError } from 'utils/helperUtils';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';

interface InputProps {}

type children = (renderProps: GetUserStatsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
  userId: string;
  resource: 'comments' | 'ideas';
}

interface State {
  count: number | undefined | null | Error;
}

export type GetUserStatsChildProps = number | undefined | null | Error;

export default class GetUserStats extends React.PureComponent<Props, State> {
  private subscription: Subscription;
  private userId$: BehaviorSubject<string>;
  private resourceType$: BehaviorSubject<'comments' | 'ideas'>;

  constructor(props) {
    super(props);
    this.state = {
      count: null,
    };
  }

  componentDidMount() {
    const { resource, userId } = this.props;

    this.userId$ = new BehaviorSubject(userId);
    this.resourceType$ = new BehaviorSubject(resource);

    this.subscription = combineLatest([
      this.resourceType$.pipe(distinctUntilChanged()),
      this.userId$.pipe(distinctUntilChanged()),
    ])
      .pipe(
        switchMap(([resourceType, userId]) => {
          if (resourceType === 'ideas') {
            return ideasCountForUser(userId).observable;
          }

          return commentsCountForUser(userId).observable;
        })
      )
      .subscribe((response) => {
        this.setState({
          count: !isNilOrError(response) ? response.count : response,
        });
      });
  }

  componentDidUpdate(prevProps: Props) {
    const { resource, userId } = this.props;

    if (prevProps.resource !== resource) {
      this.resourceType$.next(resource);
    }
    if (prevProps.userId !== userId) {
      this.userId$.next(resource);
    }
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    const { children } = this.props;
    const { count } = this.state;
    return (children as children)(count);
  }
}
