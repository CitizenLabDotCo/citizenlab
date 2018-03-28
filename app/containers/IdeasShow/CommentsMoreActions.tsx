// Libraries
import React, { FormEvent } from 'react';
import { combineLatest } from 'rxjs/Observable/combineLatest';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Services
import { ICommentData, markForDeletion, DeleteReason } from 'services/comments';
import { hasPermission } from 'services/permissions';

// Components
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import Modal from 'components/UI/Modal';
import SpamReportForm from 'containers/SpamReport';
import Button from 'components/UI/Button';
import HasPermission from 'components/HasPermission';
import CommentsAdminDeletionModal from './CommentsAdminDeletionModal';

// Styling
import styled from 'styled-components';

const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: 1rem;
  width: 100%;

  > * + * {
    margin-left: 1rem;
  }
`;

// Typing
export type Props = {
  comment: ICommentData,
  className?: string,
  onCommentEdit: {(): void};
};

export type State = {
  modalVisible_spam: boolean,
  modalVisible_delete: boolean,
  loading_deleteComment: boolean;
  actions: IAction[] | null;
};

export default class CommentsMoreActions extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      modalVisible_spam: false,
      modalVisible_delete: false,
      loading_deleteComment: false,
      actions: null,
    };
  }

  componentDidMount() {
    this.getActions().then((actions) => {
      this.setState({ actions });
    });
  }

  openDeleteModal = () => {
    this.setState({ modalVisible_delete: true });
  }

  closeDeleteModal = (event?) => {
    event && event.preventDefault();
    this.setState({ modalVisible_delete: false });
  }

  deleteComment = (reason: DeleteReason | FormEvent<HTMLButtonElement>) => {
    function isDeleteReason(reason: any): reason is DeleteReason {
      return reason.reason_code;
    }

    this.setState({
      loading_deleteComment: true,
    });

    if (!isDeleteReason(reason)) {
      markForDeletion(this.props.comment.id);
    } else {
      markForDeletion(this.props.comment.id, reason);
    }
  }

  openSpamModal = () => {
    this.setState({ modalVisible_spam: true });
  }

  closeSpamModal = () => {
    this.setState({ modalVisible_spam: false });
  }

  getActions = async (): Promise<IAction[]> => {
    return combineLatest([
      hasPermission({ item: this.props.comment, action: 'markAsSpam' }),
      hasPermission({ item: this.props.comment, action: 'delete' }),
      hasPermission({ item: this.props.comment, action: 'edit' }),
    ])
    .map(([canReport, canDelete, canEdit]) => {
      const actions: IAction[] = [];

      // Actions based on permissions
      if (canReport) actions.push({ label: <FormattedMessage {...messages.reportAsSpam} />, handler: this.openSpamModal });
      if (canDelete) actions.push({ label: <FormattedMessage {...messages.deleteComment} />, handler: this.openDeleteModal });
      if (canEdit) actions.push({ label: <FormattedMessage {...messages.editComment} />, handler: this.props.onCommentEdit });

      return actions;
    })
    .first()
    .toPromise();
  }

  render() {
    if (!this.props.comment) {
      return null;
    }

    if (!this.state.actions) {
      return null;
    }

    return (
      <>
        <MoreActionsMenu
          height="5px"
          className={this.props.className}
          actions={this.state.actions}
        />
        <Modal fixedHeight={false} opened={this.state.modalVisible_delete} close={this.closeDeleteModal} className="e2e-comment-deletion-modal">
          <HasPermission item={this.props.comment} action="justifyDeletion">
            {/* Justification required for the deletion */}
            <CommentsAdminDeletionModal onCloseDeleteModal={this.closeDeleteModal} onDeleteComment={this.deleteComment} />

            {/* No justification required */}
            <HasPermission.No>
              <p>
                <FormattedMessage {...messages.confirmCommentDeletion} />
              </p>
              <ButtonsWrapper>
                <Button style="secondary" circularCorners={false} onClick={this.closeDeleteModal}><FormattedMessage {...messages.commentDeletionCancelButton} /></Button>
                <Button style="primary" processing={this.state.loading_deleteComment} circularCorners={false} onClick={this.deleteComment}><FormattedMessage {...messages.commentDeletionConfirmButton} /></Button>
              </ButtonsWrapper>
            </HasPermission.No>
          </HasPermission>
        </Modal>
        <Modal fixedHeight={false} opened={this.state.modalVisible_spam} close={this.closeSpamModal}>
          <SpamReportForm resourceId={this.props.comment.id} resourceType="comments" />
        </Modal>
      </>
    );
  }
}
