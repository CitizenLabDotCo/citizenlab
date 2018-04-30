import React from 'react';
import { isNullOrError } from 'utils/helperUtils';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { IIdea, IIdeaData, ideaByIdStream, ideaBySlugStream } from 'services/ideas';

interface InputProps {
  id?: string | null;
  slug?: string | null;
  resetOnChange?: boolean;
}

type children = (renderProps: GetIdeaChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  idea: IIdeaData | null | Error;
}

export type GetIdeaChildProps = IIdeaData | null | Error;

export default class GetIdea extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      idea: null
    };
  }

  componentDidMount() {
    const { id, slug, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ id, slug });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .do(() => resetOnChange && this.setState({ idea: null }))
        .switchMap(({ id, slug }) => {
          let idea$: Observable<IIdea | null | Error> = Observable.of(null);

          if (id) {
            idea$ = ideaByIdStream(id).observable;
          } else if (slug) {
            idea$ = ideaBySlugStream(slug).observable;
          }

          return idea$;
        })
        .subscribe((idea) => {
          this.setState({ idea: !isNullOrError(idea) ? idea.data : idea });
        })
    ];
  }

  componentDidUpdate() {
    const { id, slug } = this.props;
    this.inputProps$.next({ id, slug });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { idea } = this.state;
    return (children as children)(idea);
  }
}
