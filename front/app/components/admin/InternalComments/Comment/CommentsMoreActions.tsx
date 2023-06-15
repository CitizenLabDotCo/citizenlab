// Libraries
import React, { FormEvent, useState } from 'react';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import commentsMessages from 'components/PostShowComponents/Comments/messages';

// Components
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import Modal from 'components/UI/Modal';
import Button from 'components/UI/Button';

// events
import { deleteCommentModalClosed } from '../events';

// Styling
import styled from 'styled-components';
import { isRtl } from 'utils/styleUtils';

import useMarkInternalCommentForDeletion from 'api/internal_comments/useMarkInternalCommentForDeletion';
import { IInternalCommentData } from 'api/internal_comments/types';
import useAuthUser from 'api/me/useAuthUser';

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
  comment: IInternalCommentData;
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
  const { data: authUser } = useAuthUser();
  const { mutate: markForDeletion, isLoading } =
    useMarkInternalCommentForDeletion({
      ideaId,
      initiativeId,
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
    const authorId = comment.relationships.author.data?.id;

    markForDeletion(
      {
        commentId,
        authorId,
        projectId,
      },
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
        <MoreActionsMenu showLabel={false} actions={actions} />
      </Container>

      <Modal
        opened={modalVisible_delete}
        close={closeDeleteModal}
        className="e2e-comment-deletion-modal"
        header={
          <FormattedMessage {...commentsMessages.confirmCommentDeletion} />
        }
      >
        <ButtonsWrapper>
          <CancelButton buttonStyle="secondary" onClick={closeDeleteModal}>
            <FormattedMessage
              {...commentsMessages.commentDeletionCancelButton}
            />
          </CancelButton>
          <AcceptButton
            buttonStyle="primary"
            processing={isLoading}
            className="e2e-confirm-deletion"
            onClick={handleDeleteClick}
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

export default CommentsMoreActions;
