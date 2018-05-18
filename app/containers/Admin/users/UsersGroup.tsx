// Libraries
import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// Components
import NoUsers from './NoUsers';

// Resources
import GetGroup, { GetGroupChildProps } from 'resources/GetGroup';

// Typings
interface InputProps {}
interface DataProps {
  group: GetGroupChildProps;
}
interface Props extends InputProps, DataProps {}
export interface State {}

export class UsersGroup extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <NoUsers/>
    );
  }
}

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <GetGroup id={inputProps.params.groupId} >
    {group => (<UsersGroup group={group} />)}
  </GetGroup>
));
