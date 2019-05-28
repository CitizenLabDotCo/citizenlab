import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { isEqual } from 'lodash-es';
import { IIdeasFilterCounts, ideasFilterCountsStream } from 'services/ideas';
import { IQueryParameters } from './GetIdeas';

type children = (renderProps: GetIdeasFilterCountsChildProps) => JSX.Element | null;

interface Props {
  queryParameters: Partial<IQueryParameters>;
  children?: children;
}

interface State {
  ideasFilterCounts: IIdeasFilterCounts | undefined| null;
}

export type GetIdeasFilterCountsChildProps = IIdeasFilterCounts | undefined| null;

export default class GetIdeasFilterCounts extends React.Component<Props, State> {
  private queryParameters$: BehaviorSubject<Partial<IQueryParameters>>;
  private subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      ideasFilterCounts: undefined
    };
  }

  componentDidMount() {
    this.queryParameters$ = new BehaviorSubject(this.props.queryParameters);

    this.subscriptions = [
      this.queryParameters$.pipe(
        distinctUntilChanged((prev, next) => isEqual(prev, next)),
        switchMap((queryParameters) => {
          return ideasFilterCountsStream({ queryParameters }).observable;
        })
      ).subscribe((ideasFilterCounts) => {
        this.setState({
          ideasFilterCounts: (ideasFilterCounts ? ideasFilterCounts : null),
        });
      })
    ];
  }

  componentDidUpdate(_prevProps: Props, _prevState: State) {
    this.queryParameters$.next(this.props.queryParameters);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { ideasFilterCounts } = this.state;
    return (children as children)(ideasFilterCounts);
  }
}
