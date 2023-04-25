import React from 'react';
import { isEqual } from 'lodash-es';
import { Subscription, BehaviorSubject, of, combineLatest } from 'rxjs';
import { distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import {
  ITopicData,
  ITopicsQueryParams,
  topicByIdStream,
  topicsStream,
} from 'services/topics';
import { isNilOrError, NilOrError, reduceErrors } from 'utils/helperUtils';
import { Code } from 'api/topics/types';

type InputProps = {
  /** Don't use the ids and the query parameters (code, exclude_code, sort) together.
   *  Only one of the two at a time.
   */
  topicIds?: string[];
  code?: Code;
  excludeCode?: Code;
  sort?: 'new' | 'custom';
  forHomepageFilter?: boolean;
  includeStaticPages?: boolean;
};

type children = (renderProps: GetTopicsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  topics: ITopicData[] | NilOrError;
}

export type GetTopicsChildProps = ITopicData[] | NilOrError;

export default class GetTopics extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      topics: undefined,
    };
  }

  setTopics(topics: ITopicData[] | NilOrError) {
    this.setState({ topics });
  }

  componentDidMount() {
    const { topicIds, code, excludeCode, sort, forHomepageFilter } = this.props;

    this.inputProps$ = new BehaviorSubject({
      topicIds,
      code,
      excludeCode,
      sort,
      forHomepageFilter,
    });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => isEqual(prev, next)),
          switchMap(
            ({ topicIds, code, excludeCode, sort, forHomepageFilter }) => {
              if (topicIds) {
                if (topicIds.length > 0) {
                  return combineLatest(
                    topicIds.map((id) => {
                      return topicByIdStream(id).observable.pipe(
                        map((topic) =>
                          !isNilOrError(topic) ? topic.data : topic
                        )
                      );
                    })
                  );
                }

                return of(null);
              } else {
                const queryParameters: ITopicsQueryParams = {
                  code,
                  exclude_code: excludeCode,
                  sort,
                  for_homepage_filter: forHomepageFilter,
                };

                return topicsStream({ queryParameters }).observable.pipe(
                  map((topics) => topics.data)
                );
              }
            }
          )
        )
        .subscribe(reduceErrors<ITopicData>(this.setTopics.bind(this))),
    ];
  }

  componentDidUpdate() {
    const { topicIds, code, excludeCode, sort, forHomepageFilter } = this.props;
    this.inputProps$.next({
      topicIds,
      code,
      excludeCode,
      sort,
      forHomepageFilter,
    });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { topics } = this.state;
    return (children as children)(topics);
  }
}
