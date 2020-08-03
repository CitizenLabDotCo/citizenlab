import React from 'react';
import { Subscription } from 'rxjs';
import { notificationsStream, TNotificationData } from 'services/notifications';

type State = {
  list: TNotificationData[] | null | undefined;
  hasMore: boolean;
};

export interface InputProps {}

type children = (renderProps: GetNotificationsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

export type GetNotificationsChildProps = State & {
  onLoadMore: () => void;
};

export default class GetNotifications extends React.Component<Props, State> {
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      list: undefined,
      hasMore: true,
    };
    this.subscriptions = [];
  }

  loadNextPage = (page = 1) => {
    const notifications$ = notificationsStream({
      queryParameters: {
        'page[size]': 8,
        'page[number]': page,
      },
    }).observable;

    this.subscriptions.push(
      notifications$.subscribe((response) => {
        const list = this.state.list
          ? this.state.list.concat(response.data)
          : response.data;
        const hasMore = !!response.links.next;
        this.setState({ list, hasMore });
      })
    );
  };

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    return (children as children)({
      ...this.state,
      onLoadMore: this.loadNextPage,
    });
  }
}
