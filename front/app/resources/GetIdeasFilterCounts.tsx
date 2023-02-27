import React from 'react';
import { BehaviorSubject, Subscription, of } from 'rxjs';
import { distinctUntilChanged, switchMap, map } from 'rxjs/operators';

// services
import {
  IIdeasFilterCounts,
  ideasFilterCountsStream,
  IIdeasQueryParameters,
} from 'services/ideas';

// utils
import { isEqual, omitBy, isNil } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

type children = (
  renderProps: GetIdeasFilterCountsChildProps
) => JSX.Element | null;

interface Props {
  queryParameters: Partial<IIdeasQueryParameters> | null;
  children?: children;
}

interface State {
  ideasFilterCounts: IIdeasFilterCounts | undefined | null;
}

export type GetIdeasFilterCountsChildProps =
  | IIdeasFilterCounts
  | undefined
  | null;

export default class GetIdeasFilterCounts extends React.Component<
  Props,
  State
> {
  private queryParameters$: BehaviorSubject<Partial<IIdeasQueryParameters> | null>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      ideasFilterCounts: undefined,
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
          switchMap((queryParameters: IIdeasQueryParameters) => {
            if (queryParameters) {
              return ideasFilterCountsStream({ queryParameters }).observable;
            }

            return of(null);
          })
        )
        .subscribe((ideasFilterCounts) => {
          this.setState({
            ideasFilterCounts: !isNilOrError(ideasFilterCounts)
              ? ideasFilterCounts
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
    const { ideasFilterCounts } = this.state;
    return (children as children)(ideasFilterCounts);
  }
}
