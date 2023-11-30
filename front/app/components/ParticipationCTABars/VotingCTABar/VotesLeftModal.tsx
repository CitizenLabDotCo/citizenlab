import React from 'react';

// components
import Modal from 'components/UI/Modal';
import {
  Box,
  Button,
  Icon,
  Text,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import SubmitButton from 'components/VotesNotSubmittedModal/SubmitButton';

// hooks
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

// style
import { useTheme } from 'styled-components';

// intl
import useLocalize from 'hooks/useLocalize';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { getCurrentPhase } from 'api/phases/utils';
import useVoting from 'api/baskets_ideas/useVoting';
import { scrollToElement } from 'utils/scroll';
import clHistory from 'utils/cl-router/history';

type Props = {
  showModal?: boolean;
  projectId?: string;
  setShowModal: (showModal: boolean) => void;
};

const VotesLeftModal = ({ projectId, showModal, setShowModal }: Props) => {
  const theme = useTheme();
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const isPhoneOrSmaller = useBreakpoint('phone');
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const currentPhase = getCurrentPhase(phases?.data);
  const votingInterface = useVoting();
  const votesCast = votingInterface.numberOfVotesCast;
  const votingMaxTotal = currentPhase?.attributes?.voting_max_total;
  const tokenNamePlural = localize(
    currentPhase?.attributes.voting_term_plural_multiloc
  );
  const tokenNameSingular = localize(
    currentPhase?.attributes.voting_term_singular_multiloc
  );
  const votesLeft =
    votingMaxTotal && votesCast ? votingMaxTotal - votesCast : votingMaxTotal;

  return (
    <Modal
      opened={showModal || false}
      close={() => {
        setShowModal(false);
      }}
      width="540px"
    >
      <Box display="flex" justifyContent="center" flexDirection="column">
        <Box
          display="flex"
          height="52px"
          width="52px"
          borderRadius="100%"
          background={theme.colors.background}
          mb="24px"
          mt="40px"
        >
          <Icon
            width="24px"
            height="24px"
            m="auto"
            fill={theme.colors.tenantPrimary}
            name="vote-ballot"
          />
        </Box>
        <Title m="0px" variant="h3">
          {formatMessage(messages.stillHaveVotesLeft, {
            votesLeft: votesLeft?.toString() || '',
            votesTerm:
              votesLeft && votesLeft > 1 ? tokenNamePlural : tokenNameSingular,
          })}
        </Title>
        <Text>
          {formatMessage(messages.stillHaveVotesLeftDescription, {
            votesTerm: tokenNamePlural,
          })}
        </Text>
        <Box display="flex" gap="12px" flexDirection="column">
          <Button
            width={isPhoneOrSmaller ? '100%' : 'fit-content'}
            minWidth="260px"
            buttonStyle="secondary"
            mx="auto"
            text={formatMessage(messages.seeOtherOptions)}
            onClick={() => {
              // If on the project page, scroll down to the status module
              if (location.pathname.includes('/projects/')) {
                setTimeout(() => {
                  scrollToElement({
                    id: 'e2e-ideas-container',
                    behavior: 'smooth',
                  });
                  setShowModal(false);
                }, 300);
              }
              // If on the idea page, redirect to project page and scroll to status module
              if (location.pathname.includes('/ideas/')) {
                clHistory.push(
                  `/projects/${project?.data.attributes.slug}?scrollToIdeas=true`
                );
              }
            }}
          />
          {currentPhase && (
            <Box
              width={isPhoneOrSmaller ? '100%' : 'undefined'}
              minWidth="260px"
              mx="auto"
            >
              <SubmitButton
                participationContext={currentPhase}
                setShowDataUnsubmittedModal={setShowModal}
                projectSlug={project?.data.attributes.slug}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default VotesLeftModal;
