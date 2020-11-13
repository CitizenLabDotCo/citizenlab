// Libraries
import React, { PureComponent, FormEvent } from 'react';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { get } from 'lodash-es';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import injectIntl from 'utils/cl-intl/injectIntl';
import { InjectedIntlProps } from 'react-intl';

// Services
import { ICommentData, markForDeletion } from 'services/comments';
import { hasPermission } from 'services/permissions';

// Components
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import Modal from 'components/UI/Modal';
import SpamReportForm from 'containers/SpamReport';
import Button from 'components/UI/Button';
import HasPermission from 'components/HasPermission';
import CommentsAdminDeletionModal from './CommentsAdminDeletionModal';

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
  ariaLabel?: string;
}

export interface State {
  modalVisible_spam: boolean;
  modalVisible_delete: boolean;
  loading_deleteComment: boolean;
  actions: IAction[] | null;
}

class CommentsMoreActions extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  private comment$: BehaviorSubject<ICommentData>;
  private subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      modalVisible_spam: false,
      modalVisible_delete: false,
      loading_deleteComment: false,
      actions: null,
    };
  }

  componentDidMount() {
    const { projectId, onCommentEdit, comment } = this.props;

    this.comment$ = new BehaviorSubject(comment);

    this.subscriptions = [
      this.comment$
        .pipe(
          switchMap((comment) => {
            return combineLatest([
              hasPermission({
                item: comment,
                action: 'markAsSpam',
                context: { projectId },
              }),
              hasPermission({
                item: comment,
                action: 'delete',
                context: { projectId },
              }),
              hasPermission({
                item: comment,
                action: 'edit',
                context: { projectId },
              }),
            ]);
          }),
          map(([canReport, canDelete, canEdit]) => {
            const actions: IAction[] = [];

            // Actions based on permissions
            if (canReport) {
              actions.push({
                label: <FormattedMessage {...messages.reportAsSpam} />,
                handler: this.openSpamModal,
              });
            }
            if (canDelete) {
              actions.push({
                label: <FormattedMessage {...messages.deleteComment} />,
                handler: this.openDeleteModal,
              });
            }
            if (canEdit) {
              actions.push({
                label: <FormattedMessage {...messages.editComment} />,
                handler: onCommentEdit,
              });
            }

            return actions;
          })
        )
        .subscribe((actions) => {
          this.setState({ actions });
        }),
    ];
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.comment !== this.props.comment) {
      this.comment$.next(this.props.comment);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  openDeleteModal = () => {
    this.setState({ modalVisible_delete: true });
  };

  closeDeleteModal = (event?: FormEvent) => {
    event && event.preventDefault();
    this.setState({ modalVisible_delete: false });
    deleteCommentModalClosed();
  };

  deleteComment = async (reason) => {
    const { projectId, comment } = this.props;
    const commentId = comment.id;
    const authorId = get(comment, 'relationships.author.data.id', undefined);
    const reasonObj = get(reason, 'reason_code') ? reason : undefined;
    this.setState({ loading_deleteComment: true });
    await markForDeletion(commentId, authorId, projectId, reasonObj);
    deleteCommentModalClosed();
    commentDeleted();
  };

  openSpamModal = () => {
    this.setState({ modalVisible_spam: true });
  };

  closeSpamModal = () => {
    this.setState({ modalVisible_spam: false });
  };

  render() {
    const { projectId, ariaLabel, comment, className } = this.props;
    const {
      actions,
      modalVisible_delete,
      loading_deleteComment,
      modalVisible_spam,
    } = this.state;

    if (!comment || !actions) {
      return null;
    }

    return (
      <>
        <Container className={className || ''}>
          <MoreActionsMenu ariaLabel={ariaLabel} actions={actions} />
        </Container>

        <Modal
          opened={modalVisible_delete}
          close={this.closeDeleteModal}
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
              onCloseDeleteModal={this.closeDeleteModal}
              onDeleteComment={this.deleteComment}
            />

            {/* No justification required */}
            <HasPermission.No>
              <ButtonsWrapper>
                <CancelButton
                  buttonStyle="secondary"
                  onClick={this.closeDeleteModal}
                >
                  <FormattedMessage {...messages.commentDeletionCancelButton} />
                </CancelButton>
                <AcceptButton
                  buttonStyle="primary"
                  processing={loading_deleteComment}
                  className="e2e-confirm-deletion"
                  onClick={this.deleteComment}
                >
                  <FormattedMessage
                    {...messages.commentDeletionConfirmButton}
                  />
                </AcceptButton>
              </ButtonsWrapper>
            </HasPermission.No>
          </HasPermission>
        </Modal>

        <Modal
          opened={modalVisible_spam}
          close={this.closeSpamModal}
          header={<FormattedMessage {...messages.reportAsSpamModalTitle} />}
        >
          <SpamReportForm resourceId={comment.id} resourceType="comments" />
        </Modal>
      </>
    );
  }
}

export default injectIntl(CommentsMoreActions);
