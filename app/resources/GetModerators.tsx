import React from 'react';
import { isEmpty } from 'lodash-es';
import { Subscription } from 'rxjs';
import { isNilOrError } from 'utils/helperUtils';
import { IUserData } from 'services/users';
import { moderatorsStream } from 'services/moderators';

interface InputProps {}

export type GetModeratorsChildProps = IUserData[] | null | undefined | Error;

type children = (renderProps: GetModeratorsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  projectId: string;
  children?: children;
}

interface State {
  moderators: GetModeratorsChildProps;
}

export default class GetModerators extends React.Component<Props, State> {
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      moderators: undefined,
    };
  }

  componentDidMount() {
    const { projectId } = this.props;

    this.subscriptions = [
      moderatorsStream(projectId).observable.subscribe((moderators) => {
        this.setState({
          moderators:
            !isNilOrError(moderators) && !isEmpty(moderators?.data)
              ? moderators.data
              : null,
        });
      }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { moderators } = this.state;
    return (children as children)(moderators);
  }
}
