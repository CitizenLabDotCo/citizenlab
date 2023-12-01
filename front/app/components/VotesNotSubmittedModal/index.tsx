import React, { useEffect, useRef, useState } from 'react';

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
import useVoting from 'api/baskets_ideas/useVoting';
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

// style
import { useTheme } from 'styled-components';

// intl
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// types
import { IBasket } from 'api/baskets/types';
// eslint-disable-next-line no-restricted-imports
import { Transition } from 'history';

// utils
import { getCurrentPhase } from 'api/phases/utils';
import clHistory from 'utils/cl-router/history';
import { useLocation } from 'react-router-dom';

type Props = {
  showModal?: boolean;
  projectId?: string;
  basket?: IBasket;
  basketSubmitted?: boolean;
};
const VotesNotSubmittedModal = ({
  projectId,
  showModal,
  basket,
  basketSubmitted,
}: Props) => {
  const { formatMessage } = useIntl();
  const theme = useTheme();
  const location = useLocation();
  const isPhoneOrSmaller = useBreakpoint('phone');
  const votingInterface = useVoting();
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const currentPhase = getCurrentPhase(phases?.data);

  const [transition, setTransition] = useState<Transition | undefined>(
    undefined
  );
  const [showDataUnsubmittedModal, setShowDataUnsubmittedModal] = useState(
    showModal || false
  );

  const leavePage = useRef(false);
  const votesCastRef = useRef(votingInterface?.numberOfVotesCast);

  //
  //
  // ********************** WIP CODE ***************************
  // FUNCTION: Show modal when navigating away from a voting context (idea or project page)
  // when there is an unsubmitted basket with votes in it.
  if (currentPhase?.attributes.participation_method === 'voting') {
    // history.Block() documentation --> https://github.com/remix-run/history/blob/main/docs/blocking-transitions.md
    const unblock = clHistory.block((transition) => {
      // ************************************************************
      // NOTE: This code isn't clean - just trying to get this to work.
      // ************************************************************

      const allowRedirect = () => {
        unblock();
        transition.retry();
        return null;
      };

      // If the user has selected "leave page" in the modal, allow the redirect
      if (leavePage.current) {
        allowRedirect();
      }

      // If no votes selected, allow the redirect
      if (
        votesCastRef.current === undefined ||
        votesCastRef.current === 0 ||
        basket?.data.attributes.total_votes === 0
      ) {
        allowRedirect();
      }

      // If replacing URL or going back, allow redirect. If basket is submitted, allow redirect.
      if (
        transition.action === 'REPLACE' ||
        transition.action === 'POP' ||
        basketSubmitted
      ) {
        allowRedirect();
      } else {
        if (
          // If we're on a project page and going to an idea page (didn't think it needed to be more specific, as
          // the chance of a user going from a project page to an idea page NOT within project would require
          // a specific URL being entered into the search bar. Probably unlikely for this to happen.
          location.pathname.includes('/projects/') &&
          transition.location.pathname.includes('/ideas/')
        ) {
          allowRedirect();
        }
        if (
          // If we're going from an idea page to the associated project page, allow redirect
          location.pathname.includes('/ideas/') &&
          transition.location.pathname.includes(
            `/projects/${project?.data.attributes.slug}`
          )
        ) {
          allowRedirect();
        } else {
          setTransition(transition);
          setShowDataUnsubmittedModal(true);
          return;
        }
      }

      // By default, allow the redirect
      unblock();
      transition.retry();
      return;
    });
  }
  // ^ ********************* WIP CODE **************************
  // ***********************************************************
  //

  useEffect(() => {
    votesCastRef.current = votingInterface?.numberOfVotesCast;
  }, [votingInterface?.numberOfVotesCast]);

  useEffect(() => {
    function beforeUnloadHandler(event) {
      if (
        votesCastRef.current === undefined ||
        votesCastRef.current === 0 ||
        basket?.data.attributes.total_votes === 0
      ) {
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

    if (!basketSubmitted) {
      window.onbeforeunload = beforeUnloadHandler;
    }

    if (basketSubmitted) {
      window.onbeforeunload = null;
    }
  }, [basket?.data.attributes.total_votes, basketSubmitted]);

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
          {formatMessage(messages.submitYourVote)}
        </Title>
        <Text>{formatMessage(messages.submitYourVoteDescription)}</Text>
        <Box display="flex" gap="12px" flexDirection="column">
          {transition ? (
            <Button
              width={isPhoneOrSmaller ? '100%' : 'fit-content'}
              minWidth="260px"
              buttonStyle="secondary"
              mx="auto"
              text={formatMessage(messages.leavePage)}
              onClick={() => {
                leavePage.current = true;
                transition.retry();
                setShowDataUnsubmittedModal(false);
              }}
            />
          ) : (
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
          )}
          {currentPhase && (
            <Box
              width={isPhoneOrSmaller ? '100%' : 'undefined'}
              minWidth="260px"
              mx="auto"
            >
              <SubmitButton
                participationContext={currentPhase}
                setShowDataUnsubmittedModal={setShowDataUnsubmittedModal}
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
