import { isEqual, isNil, omitBy } from 'lodash-es';
import React from 'react';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import {
  IInitiativesFilterCounts,
  initiativesFilterCountsStream,
} from 'services/initiatives';
import { isNilOrError } from 'utils/helperUtils';
import { IQueryParameters } from './GetInitiatives';

type children = (
  renderProps: GetInitiativesFilterCountsChildProps
) => JSX.Element | null;

interface Props {
  queryParameters: Partial<IQueryParameters> | null;
  children?: children;
}

interface State {
  initiativesFilterCounts: IInitiativesFilterCounts | undefined | null;
}

export type GetInitiativesFilterCountsChildProps =
  | IInitiativesFilterCounts
  | undefined
  | null;

export default class GetInitiativesFilterCounts extends React.Component<
  Props,
  State
> {
  private queryParameters$: BehaviorSubject<Partial<IQueryParameters> | null>;
  private subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      initiativesFilterCounts: undefined,
    };
  }

  componentDidMount() {
    this.queryParameters$ = new BehaviorSubject(this.props.queryParameters);

    this.subscriptions = [
      this.queryParameters$
        .pipe(
          map((queryParameters) =>
            queryParameters ? omitBy(queryParameters, isNil) : queryParameters
          ),
          distinctUntilChanged((prev, next) => isEqual(prev, next)),
          switchMap((queryParameters) => {
            if (queryParameters) {
              return initiativesFilterCountsStream({ queryParameters })
                .observable;
            }

            return of(null);
          })
        )
        .subscribe((initiativesFilterCounts) => {
          this.setState({
            initiativesFilterCounts: !isNilOrError(initiativesFilterCounts)
              ? initiativesFilterCounts
              : null,
          });
        }),
    ];
  }

  componentDidUpdate() {
    this.queryParameters$.next(this.props.queryParameters);
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { initiativesFilterCounts } = this.state;
    return (children as children)(initiativesFilterCounts);
  }
}
