import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';

import { Section, SectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

import ModeratorSelect from './ModeratorSelect';
import ModeratorList from './ModeratorList';

import GetModerators, { GetModeratorsChildProps } from 'resources/GetModerators';

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
        <ModeratorSelect />
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
