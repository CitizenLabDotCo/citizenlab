import React, { memo, useState, useRef, useEffect } from 'react';

import styled from 'styled-components';

import { IIdeaData } from 'api/ideas/types';
import useDeleteIdea from 'api/ideas/useDeleteIdea';
import useAuthUser from 'api/me/useAuthUser';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import SpamReportForm from 'containers/SpamReport';

import Modal from 'components/UI/Modal';
import MoreActionsMenu from 'components/UI/MoreActionsMenu';
import WarningModal from 'components/WarningModal';
import warningMessages from 'components/WarningModal/messages';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import { usePermission } from 'utils/permissions';

import messages from '../messages';

const Container = styled.div``;

const MoreActionsMenuWrapper = styled.div`
  display: flex;
  align-items: center;
`;

interface Props {
  idea: IIdeaData;
  className?: string;
  projectId: string;
}

const IdeaMoreActions = memo(({ idea, className, projectId }: Props) => {
  const { formatMessage } = useIntl();
  const moreActionsButtonRef = useRef<HTMLButtonElement>(null);

  const [isSpamModalVisible, setIsSpamModalVisible] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);

  const openWarningModal = () => setWarningModalOpen(true);
  const closeWarningModal = () => setWarningModalOpen(false);

  useEffect(() => {
    if (!isSpamModalVisible && !warningModalOpen) {
      setTimeout(() => {
        moreActionsButtonRef.current?.focus();
        // We use a timeout to wait for the dom to be updated
      }, 0);
    }
  }, [isSpamModalVisible, warningModalOpen]);

  const { data: authUser } = useAuthUser();
  const { data: project } = useProjectById(projectId);
  const { mutate: deleteIdea, isLoading: isLoadingDeleteIdea } =
    useDeleteIdea();
  const { data: phases } = usePhases(projectId);
  const canEditIdea = usePermission({
    item: idea,
    action: 'edit',
    context: idea,
  });

  const openSpamModal = () => {
    setIsSpamModalVisible(true);
  };

  const closeSpamModal = () => {
    setIsSpamModalVisible(false);
  };

  const onEditIdea = () => {
    clHistory.push(`/ideas/edit/${idea.id}`, { scrollToTop: true });
  };

  if (!idea) return null;

  const ideaId = idea.id;

  const onDeleteIdea = () => {
    deleteIdea(ideaId, {
      onSuccess: () => {
        clHistory.goBack();
      },
    });
  };

  if (!isNilOrError(authUser) && !isNilOrError(project)) {
    const currentPhase = getCurrentPhase(phases?.data);
    const isIdeationPhase =
      currentPhase?.attributes.participation_method === 'ideation';

    const actions = [
      {
        label: <FormattedMessage {...messages.reportAsSpam} />,
        handler: openSpamModal,
      },
      ...(isIdeationPhase && canEditIdea
        ? [
            {
              label: <FormattedMessage {...messages.editPost} />,
              handler: onEditIdea,
            },
            {
              label: <FormattedMessage {...messages.deletePost} />,
              handler: openWarningModal,
            },
          ]
        : []),
    ];

    return (
      <>
        <Container className={className}>
          <MoreActionsMenuWrapper>
            <MoreActionsMenu
              ref={moreActionsButtonRef}
              id="e2e-idea-more-actions"
              labelAndTitle={<FormattedMessage {...messages.moreOptions} />}
              showLabel={false}
              actions={actions}
            />
          </MoreActionsMenuWrapper>
          <Modal
            opened={isSpamModalVisible}
            close={closeSpamModal}
            header={<FormattedMessage {...messages.reportAsSpamModalTitle} />}
          >
            <SpamReportForm targetId={idea.id} targetType="ideas" />
          </Modal>
        </Container>
        <WarningModal
          open={warningModalOpen}
          isLoading={isLoadingDeleteIdea}
          title={formatMessage(warningMessages.deleteInputTitle)}
          explanation={formatMessage(warningMessages.deleteInputExplanation)}
          onClose={closeWarningModal}
          onConfirm={onDeleteIdea}
        />
      </>
    );
  }

  return null;
});

export default IdeaMoreActions;
