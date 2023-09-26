import React, { memo, useState } from 'react';
import clHistory from 'utils/cl-router/history';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import HasPermission from 'components/HasPermission';
import MoreActionsMenu from 'components/UI/MoreActionsMenu';
import Modal from 'components/UI/Modal';
import SpamReportForm from 'containers/SpamReport';

// hooks
import useAuthUser from 'api/me/useAuthUser';
import useProjectById from 'api/projects/useProjectById';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';

// services
import { ProcessType } from 'api/projects/types';
import useDeleteIdea from 'api/ideas/useDeleteIdea';

// styling
import styled from 'styled-components';

// typings
import { IIdeaData } from 'api/ideas/types';

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
  const [isSpamModalVisible, setIsSpamModalVisible] = useState<boolean>(false);
  const { data: authUser } = useAuthUser();
  const { data: project } = useProjectById(projectId);
  const { mutate: deleteIdea } = useDeleteIdea();

  const openSpamModal = () => {
    setIsSpamModalVisible(true);
  };

  const closeSpamModal = () => {
    setIsSpamModalVisible(false);
  };

  const onEditIdea = () => {
    clHistory.push(`/ideas/edit/${idea.id}`);
  };

  const onDeleteIdea = (ideaId: string, processType: ProcessType) => () => {
    const deleteConfirmationMessage = {
      continuous: messages.deleteInputConfirmation,
      timeline: messages.deleteInputInTimelineConfirmation,
    }[processType];

    if (window.confirm(formatMessage(deleteConfirmationMessage))) {
      deleteIdea(ideaId, {
        onSuccess: () => {
          clHistory.goBack();
        },
      });
    }
  };

  if (
    !isNilOrError(authUser) &&
    !isNilOrError(idea) &&
    !isNilOrError(project)
  ) {
    const ideaId = idea.id;
    const processType = project.data.attributes.process_type;

    return (
      <Container className={className}>
        <MoreActionsMenuWrapper>
          <HasPermission item={idea} action="edit" context={idea}>
            <MoreActionsMenu
              labelAndTitle={<FormattedMessage {...messages.moreOptions} />}
              showLabel={false}
              id="e2e-idea-more-actions"
              actions={[
                {
                  label: <FormattedMessage {...messages.reportAsSpam} />,
                  handler: openSpamModal,
                },
                {
                  label: <FormattedMessage {...messages.editPost} />,
                  handler: onEditIdea,
                },
                {
                  label: <FormattedMessage {...messages.deletePost} />,
                  handler: onDeleteIdea(ideaId, processType),
                },
              ]}
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
    );
  }

  return null;
});

export default IdeaMoreActions;
