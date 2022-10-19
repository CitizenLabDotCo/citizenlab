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
import useAuthUser from 'hooks/useAuthUser';
import useProject from 'hooks/useProject';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { WrappedComponentProps } from 'react-intl';
import injectIntl from 'utils/cl-intl/injectIntl';

// services
import { deleteIdea, IIdeaData } from 'services/ideas';
import { ProcessType } from 'services/projects';

// styling
import styled from 'styled-components';

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

const IdeaMoreActions = memo(
  ({
    idea,
    className,
    projectId,
    intl: { formatMessage },
  }: Props & WrappedComponentProps) => {
    const [isSpamModalVisible, setIsSpamModalVisible] =
      useState<boolean>(false);
    const authUser = useAuthUser();
    const project = useProject({ projectId });

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
        deleteIdea(ideaId);
        clHistory.goBack();
      }
    };

    if (
      !isNilOrError(authUser) &&
      !isNilOrError(idea) &&
      !isNilOrError(project)
    ) {
      const ideaId = idea.id;
      const processType = project.attributes.process_type;

      return (
        <Container className={className}>
          <MoreActionsMenuWrapper>
            <HasPermission item={idea} action="edit" context={idea}>
              <MoreActionsMenu
                label={<FormattedMessage {...messages.moreOptions} />}
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
                  label={<FormattedMessage {...messages.moreOptions} />}
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
            <SpamReportForm resourceId={idea.id} resourceType="ideas" />
          </Modal>
        </Container>
      );
    }

    return null;
  }
);

export default injectIntl(IdeaMoreActions);
