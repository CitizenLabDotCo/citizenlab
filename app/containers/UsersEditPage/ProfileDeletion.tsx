// Libraries
import React, { PureComponent } from 'react';

// Styles
import styled from 'styled-components';

// components
import ProfileSection from './ProfileSection';
import { SectionTitle, SectionSubtitle } from 'components/admin/Section';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// utils
import LoadableModal from 'components/Loadable/Modal';
import DeletionDialog from './DeletionDialog';

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  > :not(:last-child) {
    margin-right: 20px;
  }
`;

interface Props {
  userId: string;
}

interface State {
  dialogOpened: boolean;
}

class ProfileDeletion extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      dialogOpened: true
    };
  }

  onCloseDialog = () => {
    this.setState({ dialogOpened: false });
  }

  openDialog = () => {
    this.setState({ dialogOpened: true });
  }

  render() {
    const { dialogOpened } = this.state;

    return (
      <>
      <ProfileSection>
        <SectionTitle><FormattedMessage {...messages.deletionSection} /></SectionTitle>
        <SectionSubtitle><FormattedMessage {...messages.deletionSubtitle} /></SectionSubtitle>
        <Row>
          <Button
            style="delete"
            id="deletion"
            onClick={this.openDialog}
            width="auto"
            justifyWrapper="left"
            className="e2e-delete-profile"
          >
            <FormattedMessage {...messages.deleteMyAccount} />
          </Button>
        </Row>
      </ProfileSection>
      <LoadableModal
        opened={dialogOpened}
        close={this.onCloseDialog}
      >
        <DeletionDialog
          closeDialog={this.onCloseDialog}
        />
      </LoadableModal>
      </>
    );
  }
}

export default injectIntl(ProfileDeletion);
