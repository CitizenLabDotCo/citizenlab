import React from 'react';
import { isEqual, get, isString, omitBy, isNil, isError } from 'lodash-es';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, mergeScan, map } from 'rxjs/operators';
import { getGroups, IGroups, IGroupData } from 'services/groups';
import shallowCompare from 'utils/shallowCompare';

export type MembershipType = 'manual' | 'rules';

export interface InputProps {
  pageNumber?: number;
  pageSize?: number;
  membershipType?: MembershipType;
}

interface IQueryParameters {
  'page[number]'?: number;
  'page[size]'?: number;
  membership_type?: MembershipType;
}

interface IAccumulator {
  groupsList: IGroupData[] | undefined | null | Error;
  queryParameters: IQueryParameters;
  hasMore: boolean;
}

type children = (renderProps: GetGroupsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

export type GetGroupsChildProps = State & {
  onLoadMore: () => void;
  onChangeMembershipType: (membershipType: MembershipType) => void;
};

interface State {
  queryParameters: IQueryParameters;
  groupsList: IGroupData[] | undefined | null | Error;
  hasMore: boolean;
  querying: boolean;
  loadingMore: boolean;
}

export default class GetGroups extends React.Component<Props, State> {
  private queryParameters$: BehaviorSubject<IQueryParameters>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      // defaults
      queryParameters: {
        'page[number]': 1,
        'page[size]': 250,
        membership_type: undefined,
      },
      groupsList: null,
      hasMore: false,
      querying: true,
      loadingMore: false,
    };

    const queryParameters = this.getQueryParameters(this.state, this.props);
    this.queryParameters$ = new BehaviorSubject(queryParameters);
    this.subscriptions = [];
  }

  componentDidMount() {
    const queryParameters = this.getQueryParameters(this.state, this.props);
    const startAccumulatorValue: IAccumulator = {
      queryParameters,
      groupsList: undefined,
      hasMore: false,
    };

    this.subscriptions = [
      this.queryParameters$
        .pipe(
          distinctUntilChanged((x, y) => shallowCompare(x, y)),
          mergeScan<IQueryParameters, IAccumulator>((acc, queryParameters) => {
            const isLoadingMore =
              acc.queryParameters['page[number]'] !==
              queryParameters['page[number]'];
            queryParameters['page[number]'] = isLoadingMore
              ? queryParameters['page[number]']
              : 1;

            this.setState({
              querying: !isLoadingMore,
              loadingMore: isLoadingMore,
            });

            return getGroups({
              queryParameters,
            }).observable.pipe(
              map((groups: IGroups | Error) => {
                const selfLink = get(groups, 'links.self');
                const lastLink = get(groups, 'links.last');
                const hasMore =
                  isString(selfLink) &&
                  isString(lastLink) &&
                  selfLink !== lastLink;
                const accumulatedGroupsList = acc.groupsList;
                let groupsList: IGroupData[] | undefined | null | Error =
                  undefined;

                if (isError(groups)) {
                  groupsList = groups;
                } else if (isError(accumulatedGroupsList)) {
                  groupsList = accumulatedGroupsList;
                } else if (isLoadingMore && !isNil(accumulatedGroupsList)) {
                  groupsList = [...accumulatedGroupsList, ...groups.data];
                } else {
                  groupsList = groups.data;
                }

                return {
                  queryParameters,
                  hasMore,
                  groupsList,
                };
              })
            );
          }, startAccumulatorValue)
        )
        .subscribe(({ groupsList, queryParameters, hasMore }) => {
          this.setState({
            queryParameters,
            hasMore,
            groupsList,
            querying: false,
            loadingMore: false,
          });
        }),
    ];
  }

  componentDidUpdate(prevProps: Props, _prevState: State) {
    const { children: _prevChildren, ...prevPropsWithoutChildren } = prevProps;
    const { children: _nextChildren, ...nextPropsWithoutChildren } = this.props;

    if (!isEqual(prevPropsWithoutChildren, nextPropsWithoutChildren)) {
      const queryParameters = this.getQueryParameters(this.state, this.props);
      this.queryParameters$.next(queryParameters);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  getQueryParameters = (state: State, props: Props) => {
    return {
      ...state.queryParameters,
      ...omitBy(
        {
          'page[number]': props.pageNumber,
          'page[size]': props.pageSize,
          membership_type: props.membershipType,
        },
        isNil
      ),
    };
  };

  loadMore = () => {
    if (!this.state.loadingMore) {
      this.queryParameters$.next({
        ...this.state.queryParameters,
        'page[number]': (this.state.queryParameters['page[number]'] || 0) + 1,
      });
    }
  };

  handleMembershipTypeOnChange = (membershipType: MembershipType) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      membership_type: membershipType,
    });
  };

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
      onLoadMore: this.loadMore,
      onChangeMembershipType: this.handleMembershipTypeOnChange,
    });
  }
}
