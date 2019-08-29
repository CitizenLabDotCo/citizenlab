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
import { deleteIdea, IIdeaData } from 'services/ideas';

// router
import clHistory from 'utils/cl-router/history';
import { fontSizes } from 'utils/styleUtils';

import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

const Container = styled.div``;

const MoreActionsMenuWrapper = styled.div``;

interface InputProps {
  idea: IIdeaData;
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

class IdeaMoreActions extends PureComponent<Props & InjectedIntlProps, State>{

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

  onEditIdea = () => {
    clHistory.push(`/ideas/edit/${this.props.idea.id}`);
  }

  onDeleteIdea = (ideaId: string) => () => {
    const message = this.props.intl.formatMessage(messages.deleteIdeaConfirmation);

    if (window.confirm(message)) {
      deleteIdea(ideaId);
      clHistory.goBack();
    }
  }

  render() {
    const { idea, id, className, authUser } = this.props;
    const { spamModalVisible } = this.state;

    return !isNilOrError(authUser) && !isNilOrError(idea) ? (
      <Container className={className}>
        <MoreActionsMenuWrapper id={id}>
          <HasPermission item={idea} action="edit" context={idea}>
            <MoreActionsMenu
              actions={[
                {
                  label: <FormattedMessage {...messages.reportAsSpam} />,
                  handler: this.openSpamModal,
                },
                {
                  label: <FormattedMessage {...messages.editIdea} />,
                  handler: this.onEditIdea,
                },
                {
                  label: <FormattedMessage {...messages.deleteIdea} />,
                  handler: this.onDeleteIdea(idea.id),
                }
              ]}
              label={<FormattedMessage {...messages.moreOptions} />}
              fontSize={fontSizes.small}
              id="e2e-idea-more-actions-menu"
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
          label={this.props.intl.formatMessage(messages.spamModalLabelIdea)}
          header={<FormattedMessage {...messages.reportAsSpamModalTitle} />}
        >
          <SpamReportForm
            resourceId={idea.id}
            resourceType="ideas"
          />
        </Modal>
      </Container>
    )
    :
    null;
  }

}
const IdeaMoreActionsWithHOCs = injectIntl(IdeaMoreActions);

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaMoreActionsWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
