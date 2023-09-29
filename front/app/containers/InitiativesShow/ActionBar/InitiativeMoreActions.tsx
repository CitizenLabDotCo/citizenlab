import React, { useState } from 'react';
import styled from 'styled-components';

// components
import HasPermission from 'components/HasPermission';
import MoreActionsMenu from 'components/UI/MoreActionsMenu';
import Modal from 'components/UI/Modal';
import SpamReportForm from 'containers/SpamReport';
import WarningModal from 'components/WarningModal';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';
import warningMessages from 'components/WarningModal/messages';

// router
import clHistory from 'utils/cl-router/history';

// hooks
import useDeleteInitiative from 'api/initiatives/useDeleteInitiative';

// types
import { IInitiativeData } from 'api/initiatives/types';

const Container = styled.div``;

const MoreActionsMenuWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 35px;
`;

interface Props {
  initiative: IInitiativeData;
  className?: string;
  color?: string;
  id: string;
}

const InitiativeMoreActions = ({ initiative, className, color, id }: Props) => {
  const { formatMessage } = useIntl();

  const [spamModalVisible, setSpamModalVisible] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);

  const openWarningModal = () => setWarningModalOpen(true);
  const closeWarningModal = () => setWarningModalOpen(false);

  const { mutate: deleteInitiative, isLoading: isLoadingDeleteInitiative } =
    useDeleteInitiative();

  const openSpamModal = () => {
    setSpamModalVisible(true);
  };

  const closeSpamModal = () => {
    setSpamModalVisible(false);
  };

  const onEditInitiative = () => {
    clHistory.push(`/initiatives/edit/${initiative.id}`);
  };

  if (!initiative) {
    return null;
  }

  const onDeleteInitiative = () => {
    const initiativeId = initiative.id;

    deleteInitiative(
      { initiativeId },
      {
        onSuccess: () => {
          clHistory.goBack();
        },
      }
    );
  };

  return (
    <>
      <Container className={className}>
        <MoreActionsMenuWrapper>
          <HasPermission item={initiative} action="edit" context={initiative}>
            <MoreActionsMenu
              labelAndTitle={<FormattedMessage {...messages.moreOptions} />}
              color={color}
              id={id}
              actions={[
                {
                  label: <FormattedMessage {...messages.reportAsSpam} />,
                  handler: openSpamModal,
                },
                ...(initiative.attributes.editing_locked
                  ? []
                  : [
                      {
                        label: (
                          <FormattedMessage {...messages.editInitiative} />
                        ),
                        handler: onEditInitiative,
                      },
                    ]),
                {
                  label: <FormattedMessage {...messages.deleteInitiative} />,
                  handler: openWarningModal,
                },
              ]}
            />
            <HasPermission.No>
              <MoreActionsMenu
                labelAndTitle={<FormattedMessage {...messages.moreOptions} />}
                color={color}
                id={id}
                actions={[
                  {
                    label: <FormattedMessage {...messages.reportAsSpam} />,
                    handler: openSpamModal,
                  },
                ]}
              />
            </HasPermission.No>
          </HasPermission>
        </MoreActionsMenuWrapper>
        <Modal
          opened={spamModalVisible}
          close={closeSpamModal}
          header={<FormattedMessage {...messages.reportAsSpamModalTitle} />}
        >
          <SpamReportForm targetId={initiative.id} targetType="initiatives" />
        </Modal>
      </Container>
      <WarningModal
        open={warningModalOpen}
        isLoading={isLoadingDeleteInitiative}
        title={formatMessage(warningMessages.deleteInitiativeTitle)}
        explanation={formatMessage(warningMessages.deleteInitiativeExplanation)}
        onClose={closeWarningModal}
        onConfirm={onDeleteInitiative}
      />
    </>
  );
};

export default InitiativeMoreActions;
