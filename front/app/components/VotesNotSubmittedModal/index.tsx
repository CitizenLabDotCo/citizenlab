import React, { useEffect, useState } from 'react';

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
import SubmitButton from './SubmitButton';

// hooks
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';
import useAuthUser from 'api/me/useAuthUser';

// style
import { useTheme } from 'styled-components';

// intl
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// types
import { IBasket } from 'api/baskets/types';

// utils
import { getCurrentPhase } from 'api/phases/utils';
import { isNilOrError } from 'utils/helperUtils';

type Props = {
  projectId?: string;
  basket?: IBasket;
};
const VotesNotSubmittedModal = ({ projectId, basket }: Props) => {
  const { formatMessage } = useIntl();
  const theme = useTheme();
  const isPhoneOrSmaller = useBreakpoint('phone');
  const { data: project } = useProjectById(projectId);
  const { data: authUser } = useAuthUser();
  const { data: phases } = usePhases(projectId);
  const currentPhase = getCurrentPhase(phases?.data);
  const basketSubmitted = !isNilOrError(basket?.data.attributes.submitted_at);
  const votingMethod = currentPhase?.attributes?.voting_method;

  const [showDataUnsubmittedModal, setShowDataUnsubmittedModal] =
    useState(false);

  useEffect(() => {
    function beforeUnloadHandler(event) {
      if (basket?.data.attributes.total_votes === 0) {
        return null; // Don't show the popup if there are no votes selected
      } else {
        // If the user cancels the browser popup, show a modal with more information

        // Recommended to preventDefault when we want to show the browser popup
        event.preventDefault();
        // Setting the return value to true is for legacy support, e.g. Chrome/Edge < 119
        event.returnValue = true;

        // After 1 second, show the modal (ensures the sliding down animation is shown)
        setTimeout(() => {
          setShowDataUnsubmittedModal(true);
        }, 1000);
      }
      return;
    }

    // If the basket has not been submitted, show a modal prompting submission
    if (!basketSubmitted) {
      isPhoneOrSmaller
        ? // On mobile we need to use the onvisibilitychange. The modal is shown when a user retuns to a tab/window.
          (document.onvisibilitychange = beforeUnloadHandler)
        : // On desktop we can use the onbeforeunload event. The modal is shown after a browser popup which intercepts the window close.
          (window.onbeforeunload = beforeUnloadHandler);
    }

    if (basketSubmitted || !authUser?.data) {
      isPhoneOrSmaller
        ? (document.onvisibilitychange = null)
        : (window.onbeforeunload = null);
    }
  }, [
    basket?.data.attributes.total_votes,
    basketSubmitted,
    isPhoneOrSmaller,
    authUser,
  ]);

  return (
    <Modal
      opened={showDataUnsubmittedModal}
      close={() => {
        setShowDataUnsubmittedModal(false);
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
          {votingMethod === 'budgeting'
            ? formatMessage(messages.submitYourBudget)
            : formatMessage(messages.submitYourVote)}
        </Title>
        <Text>{formatMessage(messages.submitYourVoteDescription)}</Text>
        <Box display="flex" gap="12px" flexDirection="column">
          <Button
            width={isPhoneOrSmaller ? '100%' : 'fit-content'}
            minWidth="260px"
            buttonStyle="secondary"
            mx="auto"
            text={formatMessage(messages.doNotSubmitYet)}
            onClick={() => {
              setShowDataUnsubmittedModal(false);
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
                setShowModal={setShowDataUnsubmittedModal}
                projectSlug={project?.data.attributes.slug}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default VotesNotSubmittedModal;
