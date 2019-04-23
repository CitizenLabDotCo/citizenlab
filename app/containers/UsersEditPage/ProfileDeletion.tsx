// Libraries
import React, { PureComponent } from 'react';

// router
import clHistory from 'utils/cl-router/history';

import { deleteUser } from 'services/users';

// Styles
import ProfileSection from './ProfileSection';
import { SectionTitle, SectionSubtitle } from 'components/admin/Section';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import Button from 'components/UI/Button';
import { InjectedIntlProps } from 'react-intl';
import { signOut } from 'services/auth';
import messages from './messages';
import styled from 'styled-components';
import { withRouter, WithRouterProps } from 'react-router';

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

interface Props {
  userId: string;
}

interface State {
  processing: boolean;
}

class ProfileDeletion extends PureComponent<Props & InjectedIntlProps & WithRouterProps, State> {
  deleteProfile = () => {
    const { intl: { formatMessage }, location } = this.props;
    if (window.confirm(formatMessage(messages.profileDeletionConfirmation))) {
      this.setState({ processing: true });
      deleteUser(this.props.userId).then(() => signOut()).catch(err => console.log(err));
      clHistory.push({
        pathname: '/',
        state: { ...location.state, userDeletionSuccess: true }
      });
    }
  }

  render() {
    return (
      <ProfileSection>
        <SectionTitle><FormattedMessage {...messages.deletionSection} /></SectionTitle>
        <SectionSubtitle><FormattedMessage {...messages.deletionSubtitle} /></SectionSubtitle>
        <Row>
          <Button
            style="delete"
            id="deletion"
            onClick={this.deleteProfile}
            width="auto"
            justifyWrapper="left"
          >
            <FormattedMessage {...messages.deleteProfile} />
          </Button>
        </Row>
      </ProfileSection>
    );
  }

}

export default withRouter(injectIntl(ProfileDeletion));
