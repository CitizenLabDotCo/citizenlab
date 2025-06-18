import React, { FormEvent, useState, useRef } from 'react';

import { isRtl } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { DeleteReason, ICommentData } from 'api/comments/types';
import useMarkCommentForDeletion from 'api/comments/useMarkCommentForDeletion';

import SpamReportForm from 'containers/SpamReport';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';

import { FormattedMessage } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import { deleteCommentModalClosed } from '../events';
import messages from '../messages';

import CommentsAdminDeletionModal from './CommentsAdminDeletionModal';

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

const CancelButton = styled(ButtonWithLink)`
  margin-right: 10px;
  margin-top: 5px;
  margin-bottom: 5px;
`;

const AcceptButton = styled(ButtonWithLink)`
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
}

const CommentsMoreActions = ({
  projectId,
  onCommentEdit,
  comment,
  className,
  ideaId,
}: Props) => {
  const moreActionsButtonRef = useRef<HTMLButtonElement>(null);
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const parentCommentId = comment.relationships?.parent?.data?.id;
  const { mutate: markForDeletion, isLoading } = useMarkCommentForDeletion({
    ideaId,
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
        <MoreActionsMenu
          showLabel={false}
          actions={actions}
          ref={moreActionsButtonRef}
        />
      </Container>

      <Modal
        opened={modalVisible_delete}
        close={closeDeleteModal}
        className="e2e-comment-deletion-modal"
        returnFocusRef={moreActionsButtonRef}
        header={<FormattedMessage {...messages.confirmCommentDeletion} />}
      >
        {needsToJustifyDeletion ? (
          <CommentsAdminDeletionModal
            onCloseDeleteModal={closeDeleteModal}
            onDeleteComment={deleteComment}
          />
        ) : (
          <ButtonsWrapper>
            <CancelButton
              buttonStyle="secondary-outlined"
              onClick={closeDeleteModal}
            >
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
        returnFocusRef={moreActionsButtonRef}
        header={<FormattedMessage {...messages.reportAsSpamModalTitle} />}
      >
        <SpamReportForm targetId={comment.id} targetType="comments" />
      </Modal>
    </>
  );
};

export default CommentsMoreActions;
