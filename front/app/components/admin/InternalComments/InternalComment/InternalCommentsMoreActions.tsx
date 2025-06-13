import React, { FormEvent, useState, useRef } from 'react';

import { isRtl } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IInternalCommentData } from 'api/internal_comments/types';
import useMarkInternalCommentForDeletion from 'api/internal_comments/useMarkInternalCommentForDeletion';
import useAuthUser from 'api/me/useAuthUser';

import commentsMessages from 'components/PostShowComponents/Comments/messages';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';

import { FormattedMessage } from 'utils/cl-intl';

import { deleteCommentModalClosed } from '../events';

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
  comment: IInternalCommentData;
  onCommentEdit: () => void;
  className?: string;
  ideaId: string | undefined;
}

const InternalCommentsMoreActions = ({
  onCommentEdit,
  comment,
  className,
  ideaId,
}: Props) => {
  const moreActionsButtonRef = useRef<HTMLButtonElement>(null);
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const parentCommentId = comment.relationships?.parent?.data?.id;
  const { data: authUser } = useAuthUser();
  const { mutate: markForDeletion, isLoading } =
    useMarkInternalCommentForDeletion({
      ideaId,
      parentCommentId,
    });
  const [modalVisible_delete, setModalVisible_delete] = useState(false);

  const authUserId = authUser?.data.id;
  // Internal comments can only be deleted by their own author (moderator or admin)
  const authUserIsAuthor = authUserId === comment.relationships.author.data?.id;
  const canDelete = authUserIsAuthor;
  const canEdit = authUserIsAuthor;

  const openDeleteModal = () => {
    setModalVisible_delete(true);
  };

  const actions: IAction[] = [
    ...(canDelete
      ? [
          {
            label: <FormattedMessage {...commentsMessages.deleteComment} />,
            handler: openDeleteModal,
          },
        ]
      : []),
    ...(canEdit
      ? [
          {
            label: <FormattedMessage {...commentsMessages.editComment} />,
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

  const deleteComment = async () => {
    const commentId = comment.id;

    markForDeletion(
      { commentId },
      {
        onSuccess: () => {
          deleteCommentModalClosed();
          closeDeleteModal();
        },
      }
    );
  };

  return (
    <>
      <Container className={className || ''}>
        <MoreActionsMenu
          showLabel={false}
          actions={actions}
          data-cy="e2e-internal-comments-more-actions"
          ref={moreActionsButtonRef}
        />
      </Container>

      <Modal
        opened={modalVisible_delete}
        close={closeDeleteModal}
        className="e2e-comment-deletion-modal"
        returnFocusRef={moreActionsButtonRef}
        header={
          <FormattedMessage {...commentsMessages.confirmCommentDeletion} />
        }
      >
        <ButtonsWrapper>
          <CancelButton
            buttonStyle="secondary-outlined"
            onClick={closeDeleteModal}
          >
            <FormattedMessage
              {...commentsMessages.commentDeletionCancelButton}
            />
          </CancelButton>
          <AcceptButton
            buttonStyle="primary"
            processing={isLoading}
            className="e2e-confirm-internal-comment-deletion"
            onClick={handleDeleteClick}
            id="e2e-confirm-internal-comment-deletion"
          >
            <FormattedMessage
              {...commentsMessages.commentDeletionConfirmButton}
            />
          </AcceptButton>
        </ButtonsWrapper>
      </Modal>
    </>
  );
};

export default InternalCommentsMoreActions;
