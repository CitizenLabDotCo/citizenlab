import React from 'react';
import { isString } from 'lodash';
import { isNilOrError } from 'utils/helperUtils';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import shallowCompare from 'utils/shallowCompare';
import { IIdeaData, ideaByIdStream, ideaBySlugStream } from 'services/ideas';

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
  idea: IIdeaData | undefined | null | Error;
}

export type GetIdeaChildProps = IIdeaData | undefined | null | Error;

export default class GetIdea extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  public static defaultProps: Partial<Props> = {
    resetOnChange: true
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      idea: undefined
    };
  }

  componentDidMount() {
    const { id, slug, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ id, slug });

    this.subscriptions = [
      this.inputProps$.pipe(
        distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
        tap(() => resetOnChange && this.setState({ idea: undefined })),
        switchMap(({ id, slug }) => {
          if (isString(id)) {
            return ideaByIdStream(id).observable;
          } else if (isString(slug)) {
            return ideaBySlugStream(slug).observable;
          }

          return of(null);
        })
      )
      .subscribe((idea) => {
        this.setState({ idea: !isNilOrError(idea) ? idea.data : idea });
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
