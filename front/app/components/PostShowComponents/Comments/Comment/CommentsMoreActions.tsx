// Libraries
import React, { FormEvent, useState } from 'react';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// Components
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import Modal from 'components/UI/Modal';
import SpamReportForm from 'containers/SpamReport';
import Button from 'components/UI/Button';
import CommentsAdminDeletionModal from '../CommentsAdminDeletionModal';
import { usePermission } from 'utils/permissions';

// events
import { deleteCommentModalClosed } from '../events';

// Styling
import styled from 'styled-components';
import { isRtl } from 'utils/styleUtils';

import useMarkCommentForDeletion from 'api/comments/useMarkCommentForDeletion';
import { DeleteReason, ICommentData } from 'api/comments/types';

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
  ideaId: string | undefined;
  initiativeId: string | undefined;
}

const CommentsMoreActions = ({
  projectId,
  onCommentEdit,
  comment,
  className,
  ideaId,
  initiativeId,
}: Props) => {
  const parentCommentId = comment.relationships?.parent?.data?.id;
  const { mutate: markForDeletion, isLoading } = useMarkCommentForDeletion({
    ideaId,
    initiativeId,
    parentCommentId,
  });

  const [modalVisible_spam, setModalVisible_spam] = useState(false);
  const [modalVisible_delete, setModalVisible_delete] = useState(false);

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

  /* Justification required for the deletion:
            when person who deletes the comment is not the author */
  const needsToJustifyDeletion = usePermission({
    item: comment,
    action: 'justifyDeletion',
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
            label: <FormattedMessage {...messages.deleteComment} />,
            handler: openDeleteModal,
          },
        ]
      : []),
    ...(canEdit
      ? [
          {
            label: <FormattedMessage {...messages.editComment} />,
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

  const handleDeleteClick = (_event: React.FormEvent) => {
    deleteComment();
  };

  const deleteComment = async (reason?: DeleteReason) => {
    const commentId = comment.id;

    markForDeletion(
      {
        commentId,
        reason,
      },
      {
        onSuccess: () => {
          deleteCommentModalClosed();
          closeDeleteModal();
        },
      }
    );
  };

  const closeSpamModal = () => {
    setModalVisible_spam(false);
  };

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
        {needsToJustifyDeletion ? (
          <CommentsAdminDeletionModal
            onCloseDeleteModal={closeDeleteModal}
            onDeleteComment={deleteComment}
          />
        ) : (
          <ButtonsWrapper>
            <CancelButton buttonStyle="secondary" onClick={closeDeleteModal}>
              <FormattedMessage {...messages.commentDeletionCancelButton} />
            </CancelButton>
            <AcceptButton
              buttonStyle="primary"
              processing={isLoading}
              className="e2e-confirm-internal-comment-deletion"
              onClick={handleDeleteClick}
            >
              <FormattedMessage {...messages.commentDeletionConfirmButton} />
            </AcceptButton>
          </ButtonsWrapper>
        )}
      </Modal>

      <Modal
        opened={modalVisible_spam}
        close={closeSpamModal}
        header={<FormattedMessage {...messages.reportAsSpamModalTitle} />}
      >
        <SpamReportForm targetId={comment.id} targetType="comments" />
      </Modal>
    </>
  );
};

export default CommentsMoreActions;
