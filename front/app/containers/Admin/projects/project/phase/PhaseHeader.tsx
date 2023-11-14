import React, { useState } from 'react';
import styled from 'styled-components';
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
} from '@citizenlab/cl2-component-library';
import useDeletePhase from 'api/phases/useDeletePhase';
import useLocalize from 'hooks/useLocalize';
import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import moment from 'moment';
import { useLocation, useParams } from 'react-router-dom';
import Link from 'utils/cl-router/Link';
import { isTopBarNavActive } from 'utils/helperUtils';
import { IPhaseData } from 'api/phases/types';
import messages from './messages';
import { ITab } from 'typings';
import { Tab } from 'components/admin/NavigationTabs';
import Modal from 'components/UI/Modal';
import clHistory from 'utils/cl-router/history';
import { ParticipationMethod } from 'utils/participationContexts';

const Container = styled(Box)`
  ${defaultCardStyle};
`;

const participationMethodMessage: Record<
  ParticipationMethod,
  MessageDescriptor
> = {
  ideation: messages.ideationPhase,
  information: messages.informationPhase,
  survey: messages.externalSurveyPhase,
  voting: messages.votingPhase,
  poll: messages.pollPhase,
  volunteering: messages.volunteeringPhase,
  document_annotation: messages.documentPhase,
  native_survey: messages.inPlatformSurveyPhase,
};

interface Props {
  phase: IPhaseData | undefined;
  tabs: ITab[];
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
          clHistory.push(`/admin/projects/${projectId}/setup`);
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
              )}{' '}
              ·
            </Text>
            <Icon
              name="calendar"
              width="16px"
              mx="2px"
              fill={colors.coolGrey600}
            />
            <Text color="coolGrey600" my="0px" variant="bodyS">
              {startAt} → {endAt}
            </Text>
          </Box>
        </Box>
        <Box
          display="flex"
          px="44px"
          boxShadow="0px 2px 4px -1px rgba(0, 0, 0, 0.06)"
          background="#FBFBFB"
        >
          {tabs.map(({ url, label }) => (
            <Tab
              label={label}
              url={url}
              key={url}
              active={isTopBarNavActive('/admin/ideas', pathname, url)}
            >
              <Link to={url}>{label}</Link>
            </Tab>
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
            <Button buttonStyle="secondary" width="auto" onClick={closeModal}>
              {formatMessage(messages.cancelDeletePhaseText)}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};
