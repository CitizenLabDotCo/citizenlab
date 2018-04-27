import React from 'react';
import { Subscription } from 'rxjs';

import { isNullOrError } from 'utils/helperUtils';

import { IUserData } from 'services/users';
import { moderatorsStream } from 'services/moderators';

interface InputProps {}

export type GetModeratorsChildProps = IUserData[] | null | Error;
type children = (renderProps: GetModeratorsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  projectId: string;
  children?: children;
}

interface State {
  moderators : GetModeratorsChildProps;
}

export default class GetModerators extends React.Component<Props, State> {
  private subscriptions : Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      moderators: null
    };
  }
  componentDidMount() {
    const { projectId } = this.props;
    this.subscriptions = [
        moderatorsStream(projectId).observable
        .subscribe(moderators => this.setState({ moderators: !isNullOrError(moderators) ? moderators.data : moderators }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { moderators } = this.state;
    return (children as children)(moderators);
  }
}
