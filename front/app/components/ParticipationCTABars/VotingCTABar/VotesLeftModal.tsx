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

// types
import { IProject } from 'api/projects/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

type Props = {
  showModal?: boolean;
  project?: IProject;
  setShowModal: (showModal: boolean) => void;
};

const VotesLeftModal = ({ project, showModal, setShowModal }: Props) => {
  const theme = useTheme();
  const { data: appConfig } = useAppConfiguration();
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const isPhoneOrSmaller = useBreakpoint('phone');
  const { data: phases } = usePhases(project?.data.id);
  const currentPhase = getCurrentPhase(phases?.data);
  const currency = appConfig?.data.attributes.settings.core.currency;
  const votingMethod = currentPhase?.attributes?.voting_method;

  const { numberOfVotesCast: votesCast } = useVoting();
  const votingMaxTotal = currentPhase?.attributes?.voting_max_total;

  const tokenNamePlural =
    votingMethod === 'budgeting'
      ? currency
      : localize(currentPhase?.attributes.voting_term_plural_multiloc);
  const tokenNameSingular =
    votingMethod === 'budgeting'
      ? currency
      : localize(currentPhase?.attributes.voting_term_singular_multiloc);

  if (!votingMaxTotal || !votesCast || !tokenNamePlural || !tokenNameSingular) {
    return null;
  }

  const votesLeft = votingMaxTotal - votesCast;

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
            votesLeft: votesLeft.toString(),
            votesTerm: votesCast > 1 ? tokenNamePlural : tokenNameSingular,
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
              // If on the project page, scroll down to the options
              if (location.pathname.includes('/projects/')) {
                setTimeout(() => {
                  scrollToElement({
                    id: 'e2e-ideas-container',
                    behavior: 'smooth',
                  });
                  setShowModal(false);
                }, 300);
              }
              // If on the idea page, redirect to project page and scroll to options
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
                setShowModal={setShowModal}
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
