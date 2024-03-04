import React, { memo, useState } from 'react';

import SpamReportForm from 'containers/SpamReport';
import styled from 'styled-components';

import HasPermission from 'components/HasPermission';
import Modal from 'components/UI/Modal';
import MoreActionsMenu from 'components/UI/MoreActionsMenu';
import WarningModal from 'components/WarningModal';
import warningMessages from 'components/WarningModal/messages';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

import { IIdeaData } from 'api/ideas/types';
import useDeleteIdea from 'api/ideas/useDeleteIdea';
import useAuthUser from 'api/me/useAuthUser';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

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

  const [isSpamModalVisible, setIsSpamModalVisible] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);

  const openWarningModal = () => setWarningModalOpen(true);
  const closeWarningModal = () => setWarningModalOpen(false);

  const { data: authUser } = useAuthUser();
  const { data: project } = useProjectById(projectId);
  const { mutate: deleteIdea, isLoading: isLoadingDeleteIdea } =
    useDeleteIdea();
  const { data: phases } = usePhases(projectId);

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
      ...(!isIdeationPhase
        ? []
        : [
            {
              label: <FormattedMessage {...messages.editPost} />,
              handler: onEditIdea,
            },
            {
              label: <FormattedMessage {...messages.deletePost} />,
              handler: openWarningModal,
            },
          ]),
    ];

    return (
      <>
        <Container className={className}>
          <MoreActionsMenuWrapper>
            <HasPermission item={idea} action="edit" context={idea}>
              <MoreActionsMenu
                labelAndTitle={<FormattedMessage {...messages.moreOptions} />}
                showLabel={false}
                id="e2e-idea-more-actions"
                actions={actions}
              />
              <HasPermission.No>
                <MoreActionsMenu
                  id="e2e-idea-more-actions"
                  actions={[
                    {
                      label: <FormattedMessage {...messages.reportAsSpam} />,
                      handler: openSpamModal,
                    },
                  ]}
                  labelAndTitle={<FormattedMessage {...messages.moreOptions} />}
                  showLabel={false}
                />
              </HasPermission.No>
            </HasPermission>
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
