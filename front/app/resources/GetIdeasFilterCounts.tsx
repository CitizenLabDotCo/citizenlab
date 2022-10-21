import { isEqual, isNil, omitBy } from 'lodash-es';
import React from 'react';
import { BehaviorSubject, of, Subscription } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { ideasFilterCountsStream, IIdeasFilterCounts } from 'services/ideas';
import { isNilOrError } from 'utils/helperUtils';
import { IQueryParameters } from './GetIdeas';

type children = (
  renderProps: GetIdeasFilterCountsChildProps
) => JSX.Element | null;

interface Props {
  queryParameters: Partial<IQueryParameters> | null;
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
  private queryParameters$: BehaviorSubject<Partial<IQueryParameters> | null>;
  private subscriptions: Subscription[];

  constructor(props) {
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
          switchMap((queryParameters) => {
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
