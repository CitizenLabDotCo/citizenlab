import React from 'react';
import { isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { IIdeaData, ideaByIdStream, ideaBySlugStream } from 'services/ideas';
import {
  IInitiativeData,
  initiativeByIdStream,
  initiativeBySlugStream,
} from 'services/initiatives';
import { GetIdeaChildProps } from 'resources/GetIdea';
import { GetInitiativeChildProps } from 'resources/GetInitiative';

export type PostType = 'idea' | 'initiative';
interface InputProps {
  id?: string | null;
  slug?: string | null;
  type: PostType;
  resetOnChange?: boolean;
}

type children = (renderProps: GetPostChildProps) => JSX.Element | null;

export type GetPostChildProps = GetIdeaChildProps | GetInitiativeChildProps;

interface Props extends InputProps {
  children?: children;
}

interface State {
  post: IIdeaData | IInitiativeData | undefined | null | Error;
}

export default class GetPost extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  static defaultProps = {
    resetOnChange: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      post: undefined,
    };
  }

  componentDidMount() {
    const { id, slug, resetOnChange, type } = this.props;

    this.inputProps$ = new BehaviorSubject({ id, slug, type });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          tap(() => resetOnChange && this.setState({ post: undefined })),
          switchMap(({ id, slug, type }) => {
            if (isString(id) && type === 'idea') {
              return ideaByIdStream(id).observable;
            }

            if (isString(id) && type === 'initiative') {
              return initiativeByIdStream(id).observable;
            }

            if (isString(slug) && type === 'idea') {
              return ideaBySlugStream(slug).observable;
            }

            if (isString(slug) && type === 'initiative') {
              return initiativeBySlugStream(slug).observable;
            }

            return of(null);
          })
        )
        .subscribe((post) => {
          this.setState({ post: !isNilOrError(post) ? post.data : post });
        }),
    ];
  }

  componentDidUpdate() {
    const { id, slug, type } = this.props;
    this.inputProps$.next({ id, slug, type });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { post } = this.state;
    return (children as children)(post);
  }
}
