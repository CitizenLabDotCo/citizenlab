import React, { PureComponent } from 'react';

import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';

import Button from 'components/UI/ButtonWithLink';
import { FormSection, FormSectionTitle } from 'components/UI/FormComponents';
import Modal from 'components/UI/Modal';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';

import DeletionDialog from './DeletionDialog';
import messages from './messages';

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  > :not(:last-child) {
    margin-right: 20px;
  }
`;

interface Props {}

interface State {
  dialogOpened: boolean;
}

class ProfileDeletion extends PureComponent<
  Props & WrappedComponentProps,
  State
> {
  constructor(props: Props & WrappedComponentProps) {
    super(props);
    this.state = {
      dialogOpened: false,
    };
  }

  onCloseDialog = () => {
    this.setState({ dialogOpened: false });
  };

  openDialog = () => {
    this.setState({ dialogOpened: true });
  };

  render() {
    const { dialogOpened } = this.state;

    return (
      <>
        <FormSection>
          <FormSectionTitle
            message={messages.deletionSection}
            subtitleMessage={messages.deletionSubtitle}
          />
          <Row>
            <Button
              buttonStyle="delete"
              id="deletion"
              onClick={this.openDialog}
              width="auto"
              justifyWrapper="left"
              data-cy="e2e-delete-profile-button"
            >
              <FormattedMessage {...messages.deleteMyAccount} />
            </Button>
          </Row>
        </FormSection>
        <Modal opened={dialogOpened} close={this.onCloseDialog}>
          <DeletionDialog closeDialog={this.onCloseDialog} />
        </Modal>
      </>
    );
  }
}

export default injectIntl(ProfileDeletion);
