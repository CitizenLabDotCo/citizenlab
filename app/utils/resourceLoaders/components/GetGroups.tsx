import React from 'react';
import { Subscription } from 'rxjs';
import { IGroupData, listGroups } from 'services/groups';

interface InputProps {}

type children = (renderProps: GetGroupsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  groups: IGroupData[] | null;
}

export type GetGroupsChildProps = IGroupData[] | null;

export default class GetGroups extends React.Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      groups: null,
    };
  }

  componentDidMount() {
    this.subscriptions = [
      listGroups().observable.subscribe((groups) => {
        this.setState({
          groups: (groups ? groups.data : null),
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { groups } = this.state;
    return (children as children)(groups);
  }
}
