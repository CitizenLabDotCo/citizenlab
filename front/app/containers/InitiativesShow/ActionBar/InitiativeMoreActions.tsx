import React, { useState } from 'react';
import styled from 'styled-components';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import HasPermission from 'components/HasPermission';
import MoreActionsMenu from 'components/UI/MoreActionsMenu';
import Modal from 'components/UI/Modal';
import SpamReportForm from 'containers/SpamReport';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';

// router
import clHistory from 'utils/cl-router/history';

// hooks
import useDeleteInitiative from 'api/initiatives/useDeleteInitiative';

// Types
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
  const { mutate: deleteInitiative } = useDeleteInitiative();

  const openSpamModal = () => {
    setSpamModalVisible(true);
  };

  const closeSpamModal = () => {
    setSpamModalVisible(false);
  };

  const onEditInitiative = () => {
    clHistory.push(`/initiatives/edit/${initiative.id}`);
  };

  const onDeleteInitiative = (initiativeId: string) => () => {
    const message = formatMessage(messages.deleteInitiativeConfirmation);

    if (window.confirm(message)) {
      deleteInitiative(
        { initiativeId },
        {
          onSuccess: () => {
            clHistory.goBack();
          },
        }
      );
    }
  };

  if (isNilOrError(initiative)) {
    return null;
  }

  return (
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
                      label: <FormattedMessage {...messages.editInitiative} />,
                      handler: onEditInitiative,
                    },
                  ]),
              {
                label: <FormattedMessage {...messages.deleteInitiative} />,
                handler: onDeleteInitiative(initiative.id),
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
  );
};

export default InitiativeMoreActions;
