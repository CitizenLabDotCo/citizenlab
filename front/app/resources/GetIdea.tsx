import React from 'react';
import { isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { IIdeaData, ideaByIdStream, ideaBySlugStream } from 'services/ideas';

interface InputProps {
  ideaId?: string | null;
  ideaSlug?: string | null;
  resetOnChange?: boolean;
}

type children = (renderProps: GetIdeaChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

export type GetIdeaChildProps = IIdeaData | undefined | null | Error;

interface State {
  idea: GetIdeaChildProps;
}

export default class GetIdea extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  static defaultProps = {
    resetOnChange: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      idea: undefined,
    };
  }

  componentDidMount() {
    const { ideaId, ideaSlug, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ ideaId, ideaSlug });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          tap(() => resetOnChange && this.setState({ idea: undefined })),
          switchMap(({ ideaId, ideaSlug }) => {
            if (isString(ideaId)) {
              return ideaByIdStream(ideaId).observable;
            } else if (isString(ideaSlug)) {
              return ideaBySlugStream(ideaSlug).observable;
            }

            return of(null);
          })
        )
        .subscribe((idea) => {
          this.setState({ idea: !isNilOrError(idea) ? idea.data : idea });
        }),
    ];
  }

  componentDidUpdate() {
    const { ideaId, ideaSlug } = this.props;
    this.inputProps$.next({ ideaId, ideaSlug });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { idea } = this.state;
    return (children as children)(idea);
  }
}
