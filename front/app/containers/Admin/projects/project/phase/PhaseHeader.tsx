import React, { useState } from 'react';

import {
  Box,
  Title,
  Text,
  Button,
  Dropdown,
  Icon,
  DropdownListItem,
  defaultCardStyle,
  colors,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import moment from 'moment';
import { useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';

import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import { IPhaseData, ParticipationMethod } from 'api/phases/types';
import useDeletePhase from 'api/phases/useDeletePhase';

import useLocalize from 'hooks/useLocalize';

import { Tab } from 'components/admin/NavigationTabs';
import Modal from 'components/UI/Modal';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isTopBarNavActive } from 'utils/helperUtils';

import { IPhaseTab } from '../tabs';

import messages from './messages';
import PermissionTooltipMessage from './PermissionTooltipMessage';
import { getParticipantMessage } from './utils';

const Container = styled(Box)`
  ${defaultCardStyle};
`;

const participationMethodMessage: Record<
  ParticipationMethod,
  MessageDescriptor
> = {
  ideation: messages.ideationPhase,
  proposals: messages.proposalsPhase,
  information: messages.informationPhase,
  survey: messages.externalSurveyPhase,
  voting: messages.votingPhase,
  poll: messages.pollPhase,
  volunteering: messages.volunteeringPhase,
  document_annotation: messages.documentPhase,
  native_survey: messages.inPlatformSurveyPhase,
  community_monitor_survey: messages.inPlatformSurveyPhase,
};

interface Props {
  phase: IPhaseData;
  tabs: IPhaseTab[];
}

export const PhaseHeader = ({ phase, tabs }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { pathname } = useLocation();
  const [isDropdownOpened, setDropdownOpened] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { mutate: deletePhase } = useDeletePhase();
  const { projectId } = useParams() as {
    projectId: string;
  };
  const { data: permissions } = usePhasePermissions({ phaseId: phase.id });
  const participationRequirementsMessage = getParticipantMessage(
    permissions?.data,
    formatMessage
  );

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!phase) {
    return null;
  }

  const startAt = moment(phase.attributes.start_at).format('LL');
  const endAt = phase.attributes.end_at
    ? moment(phase.attributes.end_at).format('LL')
    : formatMessage(messages.noEndDate);

  const toggleDropdown = () => {
    setDropdownOpened(!isDropdownOpened);
  };

  const closeDropdown = () => {
    setDropdownOpened(false);
  };

  const closeModal = () => {
    setShowDeleteModal(false);
  };

  const handleOpenModal = () => {
    setShowDeleteModal(true);
  };

  const handleDeletePhase = () => {
    deletePhase(
      { phaseId: phase.id, projectId },
      {
        onSuccess: () => {
          closeModal();
          clHistory.push(`/admin/projects/${projectId}/phases/setup`);
        },
      }
    );
  };

  return (
    <>
      <Container mb="8px">
        <Box p="24px 40px">
          <Box display="flex" justifyContent="space-between">
            <Title my="0px" variant="h3" color="primary">
              {localize(phase.attributes.title_multiloc)}
            </Title>

            <Box>
              <Button
                icon="dots-horizontal"
                iconColor={colors.textSecondary}
                iconHoverColor={colors.textSecondary}
                boxShadow="none"
                boxShadowHover="none"
                bgColor="transparent"
                bgHoverColor="transparent"
                p="0"
                onClick={toggleDropdown}
              />
              <Dropdown
                opened={isDropdownOpened}
                onClickOutside={closeDropdown}
                className="dropdown"
                width="200px"
                right="70px"
                content={
                  <DropdownListItem onClick={() => handleOpenModal()}>
                    <Box display="flex" gap="4px" alignItems="center">
                      <Icon name="delete" fill={colors.red600} />
                      <Text color="red600" my="0px">
                        {formatMessage(messages.deletePhase)}
                      </Text>
                    </Box>
                  </DropdownListItem>
                }
              />
            </Box>
          </Box>
          <Box display="flex" alignItems="center">
            <Text color="coolGrey600" my="0px" variant="bodyS">
              {formatMessage(
                participationMethodMessage[
                  phase.attributes.participation_method
                ]
              )}
            </Text>
            <Box px="8px">·</Box>
            <Icon
              name="calendar"
              width="16px"
              mr="2px"
              fill={colors.coolGrey600}
            />
            <Button
              buttonStyle="text"
              fontSize="14px"
              onClick={() => {
                clHistory.push(
                  `/admin/projects/${projectId}/phases/${phase.id}/setup`
                );
              }}
              padding="0"
            >
              <Text color="coolGrey600" my="0px" variant="bodyS">
                {startAt} → {endAt}
              </Text>
            </Button>
            {participationRequirementsMessage && (
              <Tooltip
                disabled={false}
                placement="bottom"
                content={
                  <PermissionTooltipMessage permissions={permissions?.data} />
                }
              >
                <Box display="flex" alignItems="center">
                  <Box px="8px">·</Box>
                  <Button
                    buttonStyle="text"
                    fontSize="14px"
                    onClick={() => {
                      clHistory.push(
                        `/admin/projects/${projectId}/phases/${phase.id}/access-rights`
                      );
                    }}
                    padding="0"
                  >
                    <Box display="flex" alignItems="center">
                      <Icon
                        name="key"
                        width="16px"
                        mr="2px"
                        fill={colors.coolGrey600}
                      />
                      <Text color="coolGrey600" my="0px" variant="bodyS">
                        {participationRequirementsMessage}
                      </Text>
                    </Box>
                  </Button>
                </Box>
              </Tooltip>
            )}
          </Box>
        </Box>
        <Box
          display="flex"
          px="44px"
          boxShadow="0px 2px 4px -1px rgba(0, 0, 0, 0.06)"
          background="#FBFBFB"
        >
          {tabs.map(({ url, label, disabledTooltipText }) => (
            <Tab
              label={label}
              url={url}
              key={url}
              active={isTopBarNavActive(
                `/admin/projects/${projectId}/phases/${phase.id}`,
                pathname,
                url
              )}
              disabledTooltipText={disabledTooltipText}
            />
          ))}
        </Box>
      </Container>
      <Modal opened={showDeleteModal} close={closeModal}>
        <Box display="flex" flexDirection="column" width="100%" p="20px">
          <Box mb="40px">
            <Title variant="h3" color="primary">
              {formatMessage(messages.deletePhaseConfirmationQuestion)}
            </Title>
            <Text color="primary" fontSize="l">
              {formatMessage(messages.deletePhaseInfo)}
            </Text>
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            width="100%"
            alignItems="center"
          >
            <Button
              icon="delete"
              data-cy={`e2e-confirm-delete-phase-${phase.id}`}
              buttonStyle="delete"
              width="auto"
              mr="20px"
              onClick={handleDeletePhase}
            >
              {formatMessage(messages.deletePhaseButtonText)}
            </Button>
            <Button
              buttonStyle="secondary-outlined"
              width="auto"
              onClick={closeModal}
            >
              {formatMessage(messages.cancelDeletePhaseText)}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};
