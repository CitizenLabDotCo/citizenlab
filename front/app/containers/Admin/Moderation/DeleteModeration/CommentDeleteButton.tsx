import React, { FormEvent, useState } from 'react';

import { Tooltip } from '@citizenlab/cl2-component-library';

import { DeleteReason, ICommentData } from 'api/comments/types';
import useMarkCommentForDeletion from 'api/comments/useMarkCommentForDeletion';

import CommentsAdminDeletionModal from 'components/PostShowComponents/Comments/Comment/CommentsAdminDeletionModal';
import Button from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';

import { FormattedMessage } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import messages from './messages';

export interface Props {
  commentId?: string;
  ideaId?: string;
  projectId?: string;
  comment: ICommentData;
}

const DeleteCommentButton = ({ ideaId, comment, projectId }: Props) => {
  const commentId = comment.id;
  const { mutate: markForDeletion } = useMarkCommentForDeletion({
    ideaId,
    parentCommentId: commentId,
  });

  const [modalVisible, setModalVisible] = useState(false);

  const canDeleteComment = usePermission({
    item: comment,
    action: 'delete',
    context: { projectId },
  });

  const openDeleteModal = () => {
    setModalVisible(true);
  };

  const closeDeleteModal = (event?: FormEvent) => {
    event && event.preventDefault();
    setModalVisible(false);
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
          closeDeleteModal();
        },
      }
    );
  };

  if (!canDeleteComment) {
    return null;
  }

  return (
    <>
      <Tooltip content={<FormattedMessage {...messages.deleteComment} />}>
        <Button
          onClick={() => {
            openDeleteModal();
          }}
          buttonStyle="text"
          p="4px"
          iconSize="18px"
          icon="delete"
          mt="4px"
        />
      </Tooltip>

      <Modal
        opened={modalVisible}
        close={closeDeleteModal}
        header={<FormattedMessage {...messages.confirmCommentDeletion} />}
      >
        <CommentsAdminDeletionModal
          onCloseDeleteModal={closeDeleteModal}
          onDeleteComment={deleteComment}
        />
      </Modal>
    </>
  );
};

export default DeleteCommentButton;
