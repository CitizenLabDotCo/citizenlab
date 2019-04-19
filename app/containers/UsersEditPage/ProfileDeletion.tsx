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

interface Props {
  userId: string;
}

interface State {}

class ProfileDeletion extends PureComponent<Props & InjectedIntlProps, State> {
  deleteProfile = () => {
    const { intl: { formatMessage } } = this.props;
    if (window.confirm(formatMessage(messages.profileDeletionConfirmation))) {
      deleteUser(this.props.userId).then(() => signOut()).catch(err => console.log(err));
      clHistory.push('/');
    }
  }

  render() {

    return (
          <ProfileSection>
            <SectionTitle><FormattedMessage {...messages.deletionSection} /></SectionTitle>
            <SectionSubtitle><FormattedMessage {...messages.deletionSubtitle} /></SectionSubtitle>
            <Button
              style="delete"
              id="deletion"
              onClick={this.deleteProfile}
              width="100%"
            >
              <FormattedMessage {...messages.deleteProfile} />
            </Button>
          </ProfileSection>
    );
  }

}

export default injectIntl(ProfileDeletion);
