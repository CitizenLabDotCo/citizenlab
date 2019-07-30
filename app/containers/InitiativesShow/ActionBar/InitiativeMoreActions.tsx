import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { adopt } from 'react-adopt';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import HasPermission from 'components/HasPermission';
import MoreActionsMenu from 'components/UI/MoreActionsMenu';
import Modal from 'components/UI/Modal';
import SpamReportForm from 'containers/SpamReport';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';
import injectIntl from 'utils/cl-intl/injectIntl';

// services
import { deleteInitiative, IInitiativeData } from 'services/initiatives';

// router
import clHistory from 'utils/cl-router/history';
import { fontSizes } from 'utils/styleUtils';

import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

const Container = styled.div``;

const MoreActionsMenuWrapper = styled.div``;

interface InputProps {
  initiative: IInitiativeData;
  id: string;
  className?: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  spamModalVisible: boolean;
}

class InitiativeMoreActions extends PureComponent<Props & InjectedIntlProps, State>{

  constructor(props) {
    super(props);
    this.state = {
      spamModalVisible: false
    };
  }

  openSpamModal = () => {
    this.setState({ spamModalVisible: true });
  }

  closeSpamModal = () => {
    this.setState({ spamModalVisible: false });
  }

  onEditInitiative = () => {
    clHistory.push(`/initiatives/edit/${this.props.initiative.id}`);
  }

  onDeleteInitiative = (initiativeId: string) => () => {
    const message = this.props.intl.formatMessage(messages.deleteInitiativeConfirmation);

    if (window.confirm(message)) {
      deleteInitiative(initiativeId);
      clHistory.goBack();
    }
  }

  render() {
    const { initiative, id, className, authUser } = this.props;
    const { spamModalVisible } = this.state;

    return !isNilOrError(authUser) && !isNilOrError(initiative) ? (
      <Container className={className}>
        <MoreActionsMenuWrapper id={id}>
          <HasPermission item={initiative} action="edit" context={initiative}>
            <MoreActionsMenu
              actions={[
                {
                  label: <FormattedMessage {...messages.reportAsSpam} />,
                  handler: this.openSpamModal,
                },
                {
                  label: <FormattedMessage {...messages.editInitiative} />,
                  handler: this.onEditInitiative,
                },
                {
                  label: <FormattedMessage {...messages.deleteInitiative} />,
                  handler: this.onDeleteInitiative(initiative.id),
                }
              ]}
              label={<FormattedMessage {...messages.moreOptions} />}
              fontSize={fontSizes.small}
              id="e2e-initiative-more-actions-menu"
            />
            <HasPermission.No>
              <MoreActionsMenu
                actions={[{
                  label: <FormattedMessage {...messages.reportAsSpam} />,
                  handler: this.openSpamModal,
                }]}
                label={<FormattedMessage {...messages.moreOptions} />}
                fontSize={fontSizes.small}
              />
            </HasPermission.No>
          </HasPermission>
        </MoreActionsMenuWrapper>
        <Modal
          opened={spamModalVisible}
          close={this.closeSpamModal}
          label={this.props.intl.formatMessage(messages.spamModalLabelInitiative)}
          header={<FormattedMessage {...messages.reportAsSpamModalTitle} />}
        >
          <SpamReportForm
            resourceId={initiative.id}
            resourceType="initiatives"
          />
        </Modal>
      </Container>
    )
    :
    null;
  }

}
const InitiativeMoreActionsWithHOCs = injectIntl(InitiativeMoreActions);

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <InitiativeMoreActionsWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
