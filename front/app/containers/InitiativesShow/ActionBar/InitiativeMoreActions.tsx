import React, { useState, useRef } from 'react';

import styled from 'styled-components';

import { IInitiativeData } from 'api/initiatives/types';
import useDeleteInitiative from 'api/initiatives/useDeleteInitiative';

import SpamReportForm from 'containers/SpamReport';

import Modal from 'components/UI/Modal';
import MoreActionsMenu from 'components/UI/MoreActionsMenu';
import WarningModal from 'components/WarningModal';
import warningMessages from 'components/WarningModal/messages';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { usePermission } from 'utils/permissions';

import messages from '../messages';

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
  const moreActionsButtonRef = useRef<HTMLButtonElement>(null);
  const canEditInitiative = usePermission({
    action: 'edit',
    item: initiative,
    context: initiative,
  });

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
    clHistory.push(`/initiatives/edit/${initiative.id}`, { scrollToTop: true });
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
          <MoreActionsMenu
            labelAndTitle={<FormattedMessage {...messages.moreOptions} />}
            color={color}
            id={id}
            ref={moreActionsButtonRef}
            actions={[
              {
                label: <FormattedMessage {...messages.reportAsSpam} />,
                handler: openSpamModal,
              },
              ...(!initiative.attributes.editing_locked && canEditInitiative
                ? [
                    {
                      label: <FormattedMessage {...messages.editInitiative} />,
                      handler: onEditInitiative,
                    },
                    {
                      label: (
                        <FormattedMessage {...messages.deleteInitiative} />
                      ),
                      handler: openWarningModal,
                    },
                  ]
                : []),
            ]}
          />
        </MoreActionsMenuWrapper>
        <Modal
          opened={spamModalVisible}
          close={closeSpamModal}
          header={<FormattedMessage {...messages.reportAsSpamModalTitle} />}
          // Return focus to the More Actions button on close
          returnFocusRef={moreActionsButtonRef}
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
        returnFocusRef={moreActionsButtonRef}
      />
    </>
  );
};

export default InitiativeMoreActions;
