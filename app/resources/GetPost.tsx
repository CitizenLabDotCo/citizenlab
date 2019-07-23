import React from 'react';
import { isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { IIdeaData, ideaByIdStream, ideaBySlugStream } from 'services/ideas';
import { IInitiativeData, initiativeByIdStream, initiativeBySlugStream } from 'services/initiatives';
import { GetIdeaChildProps } from 'resources/GetIdea';
import { GetInitiativeChildProps } from 'resources/GetInitiative';

interface InputProps {
  postId?: string | null;
  slug?: string | null;
  resetOnChange?: boolean;
  postType: 'idea' | 'initiative';
}

type children = (renderProps: GetPostChildProps) => JSX.Element | null;

export type GetPostChildProps =  GetIdeaChildProps | GetInitiativeChildProps;

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
    resetOnChange: true
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      post: undefined
    };
  }

  componentDidMount() {
    const { postId, slug, resetOnChange, postType } = this.props;

    this.inputProps$ = new BehaviorSubject({ postId, slug, postType });

    this.subscriptions = [
      this.inputProps$.pipe(
        distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
        tap(() => resetOnChange && this.setState({ post: undefined })),
        switchMap(({ postId, slug, postType }) => {
          if (isString(postId)) {
            switch (postType) {
              case 'idea':
                return ideaByIdStream(postId).observable;
              case 'initiative':
                return initiativeByIdStream(postId).observable;
            }
          } else if (isString(slug)) {
            switch (postType) {
              case 'idea':
                return ideaBySlugStream(slug).observable;
              case 'initiative':
                return initiativeBySlugStream(slug).observable;
            }
          }

          return of(null);
        })
      )
      .subscribe((post) => {
        this.setState({ post: !isNilOrError(post) ? post.data : post });
      })
    ];
  }

  componentDidUpdate() {
    const { postId, slug, postType } = this.props;
    this.inputProps$.next({ postId, slug, postType });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { post } = this.state;
    return (children as children)(post);
  }
}
