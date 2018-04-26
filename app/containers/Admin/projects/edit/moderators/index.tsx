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

interface Props {
  moderators: GetModeratorsChildProps;
}

class Moderators extends React.PureComponent<Props>{
  render() {

    return (
      <Section>
        <SectionTitle>
          <FormattedMessage {...messages.moderatorsTabTitle} />
        </SectionTitle>
        <ModeratorSelect />
        <ModeratorList moderators={this.props.moderators} />
      </Section>
    );
  }
}
export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <GetModerators projectId={inputProps.params.slug}>
    {moderators => <Moderators moderators={moderators} />}
  </GetModerators>
));
