// Libraries
import React, { PureComponent } from 'react';

// Styles
import styled from 'styled-components';

// components
import { FormSection, FormSectionTitle } from 'components/UI/FormComponents';
import Button from 'components/UI/Button';
import Modal from 'components/UI/Modal';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';

// utils
import DeletionDialog from './DeletionDialog';

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
  constructor(props) {
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
              className="e2e-delete-profile"
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
