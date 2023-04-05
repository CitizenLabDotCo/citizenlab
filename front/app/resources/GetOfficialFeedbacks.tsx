import useIdeaOfficialFeedback from 'api/idea_official_feedback/useIdeaOfficialFeedback';
import { IOfficialFeedbacks } from 'api/idea_official_feedback/types';
import useInitiativeOfficialFeedback from 'api/initiative_official_feedback/useInitativeOfficialFeedback';
import { useState } from 'react';

export interface InputProps {
  postId: string | null;
  postType: 'idea' | 'initiative';
}

type children = (
  renderProps: GetOfficialFeedbacksChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

export type GetOfficialFeedbacksChildProps = State & {
  onLoadMore: () => void;
};

interface State {
  officialFeedbacksList: IOfficialFeedbacks | undefined;
  hasMore: boolean;
  querying: boolean;
  loadingMore: boolean;
}

// const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
// useInfiniteIdeas(ideaQueryParameters);

const GetOfficialFeedbacks = ({ children, postId, postType }: Props) => {
  const [pageSize, setPageSize] = useState(1);
  const {
    data: ideaFeedbacks,
    fetchNextPage: fetchNextPageIdeasFeedback,
    hasNextPage: hasNextPageIdeasFeedback,
    isFetchingNextPage: isFetchingNextPageIdeasFeedback,
  } = useIdeaOfficialFeedback({
    pageSize,
    ideaId: postId && postType === 'idea' ? postId : undefined,
  });

  const {
    data: initiativeFeedbacks,
    fetchNextPage: fetchNextPageInitiativeFeedback,
    hasNextPage: hasNextPageInitiativesFeedback,
    isFetchingNextPage: isFetchingNextPageInitiativesFeedback,
  } = useInitiativeOfficialFeedback({
    pageSize,
    initiativeId: postId && postType === 'initiative' ? postId : undefined,
  });

  const loadMore = () => {
    if (postType === 'idea') {
      fetchNextPageIdeasFeedback();
      setPageSize(10);
    } else {
      fetchNextPageInitiativeFeedback();
      setPageSize(10);
    }
  };
  // private initialState: State;
  // private postId$: BehaviorSubject<string | null>;
  // private pageSize$: BehaviorSubject<number>;
  // private subscriptions: Subscription[];
  // constructor(props: Props) {
  //   super(props);
  //   const initialState = {
  //     officialFeedbacksList: undefined,
  //     hasMore: false,
  //     querying: true,
  //     loadingMore: false,
  //   };
  //   this.initialState = initialState;
  //   this.state = initialState;
  //   this.postId$ = new BehaviorSubject(props.postId);
  //   this.pageSize$ = new BehaviorSubject(1);
  //   this.subscriptions = [];

  return (children as children)({
    onLoadMore: loadMore,
    officialFeedbacksList: {
      data:
        postType === 'idea'
          ? ideaFeedbacks?.pages.flatMap((page) => page.data) || []
          : initiativeFeedbacks?.pages.flatMap((page) => page.data) || [],
    },
  });
};

// componentDidMount() {
//   const { postType } = this.props;
//   this.subscriptions = [
//     this.postId$
//       .pipe(
//         distinctUntilChanged(),
//         filter((postId) => isString(postId)),
//         tap(() => this.setState(this.initialState)),
//         switchMap((postId: string) => {
//           return this.pageSize$.pipe(
//             distinctUntilChanged(),
//             switchMap((pageSize) => {
//               const isLoadingMore = pageSize !== 1;
//               const queryParameters = {
//                 'page[number]': 1,
//                 'page[size]': pageSize,
//               };

//               this.setState({
//                 querying: !isLoadingMore,
//                 loadingMore: isLoadingMore,
//               });

//               switch (postType) {
//                 case 'idea':
//                   return officialFeedbacksForIdeaStream(postId, {
//                     queryParameters,
//                   }).observable;
//                 case 'initiative':
//                   return officialFeedbacksForInitiativeStream(postId, {
//                     queryParameters,
//                   }).observable;
//               }
//             })
//           );
//         })
//       )
//       .subscribe((officialFeedbacksList) => {
//         const selfLink = get(officialFeedbacksList, 'links.self');
//         const lastLink = get(officialFeedbacksList, 'links.last');
//         const hasMore =
//           isString(selfLink) && isString(lastLink) && selfLink !== lastLink;

//         this.setState({
//           hasMore,
//           officialFeedbacksList: !isNilOrError(officialFeedbacksList)
//             ? officialFeedbacksList
//             : null,
//           querying: false,
//           loadingMore: false,
//         });
//       }),
//   ];
// }

// componentDidUpdate(prevProps: Props) {
//   if (this.props.postId !== prevProps.postId) {
//     this.pageSize$.next(1);
//     this.postId$.next(this.props.postId);
//   }
// }

// componentWillUnmount() {
//   this.subscriptions.forEach((subscription) => subscription.unsubscribe());
// }

// loadMore = () => {
//   if (!this.state.loadingMore && this.state.hasMore) {
//     const pageSize = this.pageSize$.getValue();
//     this.pageSize$.next(pageSize + 10);
//   }
// };
