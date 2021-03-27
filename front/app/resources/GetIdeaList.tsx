import React from 'react';
import { isEqual } from 'lodash-es';
import { Subscription, BehaviorSubject, of, combineLatest } from 'rxjs';
import { distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { IIdeaData, ideaByIdStream } from 'services/ideas';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  ids?: string[] | null;
}

type children = (renderProps: GetIdeaListChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  ideaList: (IIdeaData | Error)[] | undefined | null | Error;
}

export type GetIdeaListChildProps =
  | (IIdeaData | Error)[]
  | undefined
  | null
  | Error;

export default class GetIdeaList extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      ideaList: undefined,
    };
  }

  componentDidMount() {
    const { ids } = this.props;

    this.inputProps$ = new BehaviorSubject({ ids });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => isEqual(prev, next)),
          switchMap(({ ids }) => {
            if (ids && ids.length > 0) {
              return combineLatest(
                ids.map((id) =>
                  ideaByIdStream(id).observable.pipe(
                    map((idea) => (!isNilOrError(idea) ? idea.data : idea))
                  )
                )
              );
            }

            return of(null);
          })
        )
        .subscribe((ideaList) => {
          this.setState({ ideaList });
        }),
    ];
  }

  componentDidUpdate() {
    this.inputProps$.next({ ids: this.props.ids });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { ideaList } = this.state;
    return (children as children)(ideaList);
  }
}
