import React from 'react';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { IIdeaData, ideaByIdStream, ideaBySlugStream, IIdea } from 'services/ideas';

interface InputProps {
  id?: string;
  slug?: string;
}

interface Props extends InputProps {
  children: (renderProps: GetIdeaChildProps) => JSX.Element | null ;
}

interface State {
  idea: IIdeaData | null;
}

export type GetIdeaChildProps = State;

export default class GetIdea extends React.PureComponent<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      idea: null
    };
  }

  componentDidMount() {
    const { id, slug } = this.props;

    this.inputProps$ = new BehaviorSubject({ id, slug });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .switchMap(({ id, slug }) => {
          let idea$: Observable<IIdea | null> = Observable.of(null);

          if (id) {
            idea$ = ideaByIdStream(id).observable;
          } else if (slug) {
            idea$ = ideaBySlugStream(slug).observable;
          }

          return idea$;
        }).subscribe((idea) => {
          this.setState({ idea: (idea ? idea.data : null) });
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
    return children({ idea });
  }
}
