import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
// services
import { deleteInitiative, IInitiativeData } from 'services/initiatives';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
// router
import clHistory from 'utils/cl-router/history';
// utils
import { isNilOrError } from 'utils/helperUtils';
import SpamReportForm from 'containers/SpamReport';
// components
import HasPermission from 'components/HasPermission';
import Modal from 'components/UI/Modal';
import MoreActionsMenu from 'components/UI/MoreActionsMenu';
import messages from '../messages';

const Container = styled.div``;

const MoreActionsMenuWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 35px;
`;

interface InputProps {
  initiative: IInitiativeData;
  className?: string;
  color?: string;
  id: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  spamModalVisible: boolean;
}

class InitiativeMoreActions extends PureComponent<
  Props & WrappedComponentProps,
  State
> {
  constructor(props) {
    super(props);
    this.state = {
      spamModalVisible: false,
    };
  }

  openSpamModal = () => {
    this.setState({ spamModalVisible: true });
  };

  closeSpamModal = () => {
    this.setState({ spamModalVisible: false });
  };

  onEditInitiative = () => {
    clHistory.push(`/initiatives/edit/${this.props.initiative.id}`);
  };

  onDeleteInitiative = (initiativeId: string) => () => {
    const message = this.props.intl.formatMessage(
      messages.deleteInitiativeConfirmation
    );

    if (window.confirm(message)) {
      deleteInitiative(initiativeId);
      clHistory.goBack();
    }
  };

  render() {
    const { initiative, className, authUser, color, id } = this.props;
    const { spamModalVisible } = this.state;

    if (!isNilOrError(authUser) && !isNilOrError(initiative)) {
      return (
        <Container className={className}>
          <MoreActionsMenuWrapper>
            <HasPermission item={initiative} action="edit" context={initiative}>
              <MoreActionsMenu
                label={<FormattedMessage {...messages.moreOptions} />}
                color={color}
                id={id}
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
                  },
                ]}
              />
              <HasPermission.No>
                <MoreActionsMenu
                  label={<FormattedMessage {...messages.moreOptions} />}
                  color={color}
                  id={id}
                  actions={[
                    {
                      label: <FormattedMessage {...messages.reportAsSpam} />,
                      handler: this.openSpamModal,
                    },
                  ]}
                />
              </HasPermission.No>
            </HasPermission>
          </MoreActionsMenuWrapper>
          <Modal
            opened={spamModalVisible}
            close={this.closeSpamModal}
            header={<FormattedMessage {...messages.reportAsSpamModalTitle} />}
          >
            <SpamReportForm
              resourceId={initiative.id}
              resourceType="initiatives"
            />
          </Modal>
        </Container>
      );
    }

    return null;
  }
}

const InitiativeMoreActionsWithHOCs = injectIntl(InitiativeMoreActions);

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <InitiativeMoreActionsWithHOCs {...inputProps} {...dataProps} />
    )}
  </Data>
);
