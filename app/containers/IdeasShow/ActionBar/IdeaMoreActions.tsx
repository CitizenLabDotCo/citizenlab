import React from 'react';
import { adopt } from 'react-adopt';
import styled from 'styled-components';

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

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

// services
import { deleteIdea } from 'services/ideas';

// router
import clHistory from 'utils/cl-router/history';
import { fontSizes } from 'utils/styleUtils';

const MoreActionsMenuWrapper = styled.div``;

interface DataProps {
  authUser: GetAuthUserChildProps;
  idea: GetIdeaChildProps;
}

interface InputProps {
  ideaId: string;
  id: string;
}

interface Props extends DataProps, InputProps {}

interface State {
  spamModalVisible: boolean;
}

class IdeaMoreActions extends React.PureComponent<Props & InjectedIntlProps, State>{

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
    clHistory.push(`/ideas/edit/${this.props.ideaId}`);
  }

  onDeleteIdea = (ideaId: string) => () => {
    const message = this.props.intl.formatMessage(messages.deleteIdeaConfirmation);

    if (window.confirm(message)) {
      deleteIdea(ideaId);
      clHistory.goBack();
    }
  }

  render() {
    const { authUser, idea, ideaId, id } = this.props;
    const { spamModalVisible } = this.state;

    return !isNilOrError(authUser) && !isNilOrError(idea) ? (
      <>
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
                  handler: this.onDeleteIdea(ideaId),
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
            resourceId={ideaId}
            resourceType="ideas"
          />
        </Modal>
      </>
    )
    :
    null;
  }

}

const IdeaMoreActionsWithHOCs = injectIntl(IdeaMoreActions);

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaMoreActionsWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
