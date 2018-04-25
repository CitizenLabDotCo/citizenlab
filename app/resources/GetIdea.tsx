import React from 'react';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { IIdeaData, ideaByIdStream, ideaBySlugStream } from 'services/ideas';
import { isString } from 'lodash';

interface InputProps {
  id?: string | null;
  slug?: string | null;
}

type children = (renderProps: GetIdeaChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  idea: IIdeaData | null;
  ideaLoadingError: string | null;
}

export type GetIdeaChildProps = State;

export default class GetIdea extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      idea: null,
      ideaLoadingError: null,
    };
  }

  componentDidMount() {
    const { id, slug } = this.props;

    this.inputProps$ = new BehaviorSubject({ id, slug });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .filter(({ id, slug }) => (isString(id) || isString(slug)))
        .switchMap(({ id, slug }) => {
          if (id) {
            return ideaByIdStream(id).observable;
          } else if (slug) {
            return ideaBySlugStream(slug).observable;
          }

          return Observable.of(null);
        }).subscribe((idea) => {
          if (idea) {
            this.setState({ idea: idea.data });
          } else {
            this.setState({ ideaLoadingError: 'no idea found' });
          }
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
    return (children as children)(this.state);
  }
}
