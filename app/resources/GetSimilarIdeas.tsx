import React from 'react';
import shallowCompare from 'utils/shallowCompare';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { isString } from 'lodash-es';
import { IMinimalIdeaData, similarIdeasStream } from 'services/ideas';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  ideaId: string;
  pageSize?: number;
}

type children = (renderProps: GetSimilarIdeasChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  ideas: IMinimalIdeaData[] | undefined | null | Error;
}

export type GetSimilarIdeasChildProps =
  | IMinimalIdeaData[]
  | undefined
  | null
  | Error;

export default class GetSimilarIdeas extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  static defaultProps = {
    pageSize: 5,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      ideas: undefined,
    };
  }

  componentDidMount() {
    const { ideaId, pageSize } = this.props;

    this.inputProps$ = new BehaviorSubject({ ideaId, pageSize });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          switchMap(({ ideaId, pageSize }) => {
            if (isString(ideaId)) {
              return similarIdeasStream(ideaId, {
                queryParameters: {
                  'page[size]': pageSize,
                },
              }).observable;
            }

            return of(null);
          })
        )
        .subscribe((ideas) => {
          this.setState({ ideas: !isNilOrError(ideas) ? ideas.data : ideas });
        }),
    ];
  }

  componentDidUpdate() {
    const { ideaId, pageSize } = this.props;
    this.inputProps$.next({ ideaId, pageSize });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { ideas } = this.state;
    return (children as children)(ideas);
  }
}
