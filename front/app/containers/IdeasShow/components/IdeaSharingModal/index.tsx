import React from 'react';

import usePhases from 'api/phases/usePhases';
import { getInputTerm } from 'api/phases/utils';

import SharingModalContent from 'components/PostShowComponents/SharingModalContent';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { getInputTermMessage } from 'utils/i18n';

import messages from './messages';

interface Props {
  projectId: string;
  newIdeaId: string;
  closeIdeaSocialSharingModal: () => void;
}

const IdeaSharingModal = ({
  projectId,
  newIdeaId,
  closeIdeaSocialSharingModal,
}: Props) => {
  const { data: phases } = usePhases(projectId);
  const { formatMessage } = useIntl();

  return (
    <Modal
      opened
      close={closeIdeaSocialSharingModal}
      hasSkipButton={true}
      skipText={<>{formatMessage(messages.skipSharing)}</>}
    >
      <SharingModalContent
        postId={newIdeaId}
        title={formatMessage(
          getInputTermMessage(getInputTerm(phases?.data), {
            idea: messages.sharingModalTitle,
            option: messages.optionSharingModalTitle,
            project: messages.projectSharingModalTitle,
            question: messages.questionSharingModalTitle,
            issue: messages.issueSharingModalTitle,
            contribution: messages.contributionSharingModalTitle,
            proposal: messages.proposalSharingModalTitle,
            initiative: messages.initiativeSharingModalTitle,
            petition: messages.petitionSharingModalTitle,
            comment: messages.commentSharingModalTitle,
            response: messages.responseSharingModalTitle,
            suggestion: messages.suggestionSharingModalTitle,
            topic: messages.topicSharingModalTitle,
            post: messages.postSharingModalTitle,
            story: messages.storySharingModalTitle,
          })
        )}
        subtitle={formatMessage(messages.sharingModalSubtitle)}
      />
    </Modal>
  );
};

export default IdeaSharingModal;
