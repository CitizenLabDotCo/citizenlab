import React from 'react';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import { ICommentData } from 'services/comments';
import { IUserData } from 'services/users';
import GetUser from 'utils/resourceLoaders/components/GetUser';

import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import Modal from 'components/UI/Modal';
import SpamReportForm from 'containers/SpamReport';

export type Props = {
  commentId: ICommentData['id'],
  authorId: IUserData['id'] | null,
  className?: string,
};

export type State = {
  spamModalVisible: boolean,
  deleteModalVisible: boolean,
};

export default class CommentsMoreActions extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      spamModalVisible: false,
      deleteModalVisible: false,
    };
  }

  deleteComment = () => {
    console.log('Comment deletion');
  }

  openSpamModal = () => {
    this.setState({ spamModalVisible: true });
  }

  closeSpamModal = () => {
    this.setState({ spamModalVisible: false });
  }

  render() {
    return (
      <>
        <GetUser current>
          {({ user }) => {
            if (user) {
              // Create the actions menu
              const actions: IAction[] = [];

              if (user.id !== this.props.authorId) {
                // Report as spam
                actions.push({ label: <FormattedMessage {...messages.reportAsSpam} />, handler: this.openSpamModal });
              }

              if (user.id === this.props.authorId) {
                // Delete
                actions.push({ label: <FormattedMessage {...messages.deleteComment} />, handler: this.deleteComment });
              }

              return (
                <MoreActionsMenu
                  height="5px"
                  actions={actions}
                  className={this.props.className}
                />
              );
            } else {
              return null;
            }
          }}
        </GetUser>
        <Modal opened={this.state.spamModalVisible} close={this.closeSpamModal}>
          <SpamReportForm resourceId={this.props.commentId} resourceType="comments" />
        </Modal>
      </>
    );
  }
}
