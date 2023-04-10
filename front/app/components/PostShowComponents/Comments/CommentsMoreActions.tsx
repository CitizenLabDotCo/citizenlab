// Libraries
import React, { FormEvent, useState } from 'react';
import { get } from 'lodash-es';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Services
import { ICommentData, markForDeletion } from 'services/comments';

// Components
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import Modal from 'components/UI/Modal';
import SpamReportForm from 'containers/SpamReport';
import Button from 'components/UI/Button';
import HasPermission from 'components/HasPermission';
import CommentsAdminDeletionModal from './CommentsAdminDeletionModal';
import { usePermission } from 'services/permissions';

// events
import { deleteCommentModalClosed, commentDeleted } from './events';

// Styling
import styled from 'styled-components';
import { isRtl } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const ButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: 10px;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  padding: 30px;
`;

const CancelButton = styled(Button)`
  margin-right: 10px;
  margin-top: 5px;
  margin-bottom: 5px;
`;

const AcceptButton = styled(Button)`
  margin-top: 5px;
  margin-bottom: 5px;
`;

// Typing
export interface Props {
  projectId?: string | null;
  comment: ICommentData;
  onCommentEdit: () => void;
  className?: string;
}

export interface State {
  modalVisible_spam: boolean;
  modalVisible_delete: boolean;
  loading_deleteComment: boolean;
  actions: IAction[] | null;
}

const CommentsMoreActions = ({
  projectId,
  onCommentEdit,
  comment,
  className,
}: Props) => {
  const [modalVisible_spam, setModalVisible_spam] = useState(false);
  const [modalVisible_delete, setModalVisible_delete] = useState(false);
  const [loading_deleteComment, setLoading_deleteComment] = useState(false);

  const canReport = usePermission({
    item: comment,
    action: 'markAsSpam',
    context: { projectId },
  });

  const canDelete = usePermission({
    item: comment,
    action: 'delete',
    context: { projectId },
  });

  const canEdit = usePermission({
    item: comment,
    action: 'edit',
    context: { projectId },
  });

  const openDeleteModal = () => {
    setModalVisible_delete(true);
  };

  const openSpamModal = () => {
    setModalVisible_spam(true);
  };

  const actions: IAction[] = [
    ...(canReport
      ? [
          {
            label: <FormattedMessage {...messages.reportAsSpam} />,
            handler: openSpamModal,
          },
        ]
      : []),
    ...(canDelete
      ? [
          {
            label: <FormattedMessage {...messages.delete} />,
            handler: openDeleteModal,
          },
        ]
      : []),
    ...(canEdit
      ? [
          {
            label: <FormattedMessage {...messages.edit} />,
            handler: onCommentEdit,
          },
        ]
      : []),
  ];

  const closeDeleteModal = (event?: FormEvent) => {
    event && event.preventDefault();
    setModalVisible_delete(false);
    deleteCommentModalClosed();
  };

  const deleteComment = async (reason) => {
    const commentId = comment.id;
    const authorId = get(comment, 'relationships.author.data.id', undefined);
    const reasonObj = get(reason, 'reason_code') ? reason : undefined;
    setLoading_deleteComment(true);
    await markForDeletion(commentId, authorId, projectId, reasonObj);
    deleteCommentModalClosed();
    commentDeleted();
  };

  const closeSpamModal = () => {
    setModalVisible_spam(false);
  };

  if (!comment || !actions) {
    return null;
  }

  return (
    <>
      <Container className={className || ''}>
        <MoreActionsMenu showLabel={false} actions={actions} />
      </Container>

      <Modal
        opened={modalVisible_delete}
        close={closeDeleteModal}
        className="e2e-comment-deletion-modal"
        header={<FormattedMessage {...messages.confirmCommentDeletion} />}
      >
        <HasPermission
          item={comment}
          action="justifyDeletion"
          context={{ projectId }}
        >
          {/* Justification required for the deletion */}
          <CommentsAdminDeletionModal
            onCloseDeleteModal={closeDeleteModal}
            onDeleteComment={deleteComment}
          />

          {/* No justification required */}
          <HasPermission.No>
            <ButtonsWrapper>
              <CancelButton buttonStyle="secondary" onClick={closeDeleteModal}>
                <FormattedMessage {...messages.commentDeletionCancelButton} />
              </CancelButton>
              <AcceptButton
                buttonStyle="primary"
                processing={loading_deleteComment}
                className="e2e-confirm-deletion"
                onClick={deleteComment}
              >
                <FormattedMessage {...messages.commentDeletionConfirmButton} />
              </AcceptButton>
            </ButtonsWrapper>
          </HasPermission.No>
        </HasPermission>
      </Modal>

      <Modal
        opened={modalVisible_spam}
        close={closeSpamModal}
        header={<FormattedMessage {...messages.reportAsSpamModalTitle} />}
      >
        <SpamReportForm resourceId={comment.id} resourceType="comments" />
      </Modal>
    </>
  );
};

export default CommentsMoreActions;
