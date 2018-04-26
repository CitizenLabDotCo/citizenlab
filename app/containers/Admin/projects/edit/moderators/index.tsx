import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';

import { Section, SectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

import ModeratorSelect from './ModeratorSelect';
import ModeratorList from './ModeratorList';

import GetUsers, { GetUsersChildProps } from 'resources/GetUsers';

interface InputProps {
  projectId: string;
}

interface Props extends InputProps, GetUsersChildProps {}

class Moderators extends React.PureComponent<Props>{
  render() {
    console.log(this.props.projectId);
    return (
      <Section>
        <SectionTitle>
          <FormattedMessage {...messages.moderatorsTabTitle} />
        </SectionTitle>
        <ModeratorSelect />
        <ModeratorList users={this.props.usersList} />
      </Section>
    );
  }
}
export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <GetUsers>
    {users => <Moderators {... users} projectId={inputProps.params.slug} />}
  </GetUsers>
));
