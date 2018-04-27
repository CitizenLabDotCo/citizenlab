import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';

import { Section, SectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

import ModeratorList from './ModeratorList';
import UserSearch from 'components/UserSearch';

import GetModerators, { GetModeratorsChildProps } from 'resources/GetModerators';
import { findMembership, addMembership } from 'services/moderators';

interface InputProps {
  projectId: string;
}

interface Props extends InputProps {
  moderators: GetModeratorsChildProps;
}

class Moderators extends React.PureComponent<Props>{
  render() {
    const { moderators, projectId } = this.props;

    return (
      <Section>
        <SectionTitle>
          <FormattedMessage {...messages.moderatorsTabTitle} />
        </SectionTitle>
        <UserSearch resourceId={projectId} messages={messages} searchFunction={findMembership} addFunction={addMembership} />
        <ModeratorList moderators={moderators} projectId={projectId}/>
      </Section>
    );
  }
}
export default withRouter((inputProps: InputProps & WithRouterProps) => {
  const projectId = inputProps.params.slug;
  return (
    <GetModerators projectId={projectId}>
      {moderators => <Moderators moderators={moderators} projectId={projectId} />}
    </GetModerators>
  );
});
