import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import clHistory from 'utils/cl-router/history';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import HasPermission from 'components/HasPermission';
import MoreActionsMenu from 'components/UI/MoreActionsMenu';
import Modal from 'components/UI/Modal';
import SpamReportForm from 'containers/SpamReport';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';
import injectIntl from 'utils/cl-intl/injectIntl';

// services
import { deleteIdea, IIdeaData } from 'services/ideas';

// styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div``;

const MoreActionsMenuWrapper = styled.div`
  display: flex;
  align-items: center;

  &.hasLeftMargin {
    ${media.biggerThanMaxTablet`
      margin-left: 35px;
    `}
  }
`;

interface InputProps {
  idea: IIdeaData;
  hasLeftMargin: boolean;
  className?: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  spamModalVisible: boolean;
}

class IdeaMoreActions extends PureComponent<Props & InjectedIntlProps, State> {
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

  onEditIdea = () => {
    clHistory.push(`/ideas/edit/${this.props.idea.id}`);
  };

  onDeleteIdea = (ideaId: string) => () => {
    const message = this.props.intl.formatMessage(
      messages.deleteIdeaConfirmation
    );

    if (window.confirm(message)) {
      deleteIdea(ideaId);
      clHistory.goBack();
    }
  };

  render() {
    const { idea, hasLeftMargin, className, authUser } = this.props;
    const { spamModalVisible } = this.state;

    if (!isNilOrError(authUser) && !isNilOrError(idea)) {
      return (
        <Container className={className}>
          <MoreActionsMenuWrapper
            className={hasLeftMargin ? 'hasLeftMargin' : ''}
          >
            <HasPermission item={idea} action="edit" context={idea}>
              <MoreActionsMenu
                label={<FormattedMessage {...messages.moreOptions} />}
                id="e2e-idea-more-actions"
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
                  },
                ]}
              />
              <HasPermission.No>
                <MoreActionsMenu
                  id="e2e-idea-more-actions"
                  actions={[
                    {
                      label: <FormattedMessage {...messages.reportAsSpam} />,
                      handler: this.openSpamModal,
                    },
                  ]}
                  label={<FormattedMessage {...messages.moreOptions} />}
                />
              </HasPermission.No>
            </HasPermission>
          </MoreActionsMenuWrapper>
          <Modal
            opened={spamModalVisible}
            close={this.closeSpamModal}
            header={<FormattedMessage {...messages.reportAsSpamModalTitle} />}
          >
            <SpamReportForm resourceId={idea.id} resourceType="ideas" />
          </Modal>
        </Container>
      );
    }

    return null;
  }
}

const IdeaMoreActionsWithHOCs = injectIntl(IdeaMoreActions);

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <IdeaMoreActionsWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
