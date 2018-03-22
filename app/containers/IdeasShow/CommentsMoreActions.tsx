import React from 'react';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import { ICommentData } from 'services/comments';
import { IUserData } from 'services/users';
import GetUser from 'utils/resourceLoaders/components/GetUser';

import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import Modal from 'components/UI/Modal';
import SpamReportForm from 'containers/SpamReport';
import Button from 'components/UI/Button';

import styled from 'styled-components';

const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export type Props = {
  commentId: ICommentData['id'],
  authorId: IUserData['id'] | null,
  className?: string,
};

export type State = {
  modalVisible_spam: boolean,
  modalVisible_delete: boolean,
};

export default class CommentsMoreActions extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      modalVisible_spam: false,
      modalVisible_delete: false,
    };
  }

  openDeleteModal = () => {
    this.setState({ modalVisible_delete: true });
  }

  closeDeleteModal = () => {
    this.setState({ modalVisible_delete: false });
  }

  deleteComment = () => {
    console.log('delete');
  }

  openSpamModal = () => {
    this.setState({ modalVisible_spam: true });
  }

  closeSpamModal = () => {
    this.setState({ modalVisible_spam: false });
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
                actions.push({ label: <FormattedMessage {...messages.deleteComment} />, handler: this.openDeleteModal });
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
        <Modal fixedHeight={false} opened={this.state.modalVisible_spam} close={this.closeSpamModal}>
          <SpamReportForm resourceId={this.props.commentId} resourceType="comments" />
        </Modal>
        <Modal fixedHeight={false} opened={this.state.modalVisible_delete} close={this.closeDeleteModal} className="e2e-comment-deletion-modal">
          <p>
            <FormattedMessage {...messages.confirmCommentDeletion} />
          </p>
          <ButtonsWrapper>
            <Button style="secondary" circularCorners={false} onClick={this.closeDeleteModal}><FormattedMessage {...messages.commentDeletionCancelButton} /></Button>
            <Button style="primary" circularCorners={false} onClick={this.deleteComment}><FormattedMessage {...messages.commentDeletionConfirmButton} /></Button>
          </ButtonsWrapper>
        </Modal>
      </>
    );
  }
}
