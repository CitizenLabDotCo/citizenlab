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

// utils
import { getCurrentPhase } from 'api/phases/utils';
import { IBasket } from 'api/baskets/types';

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
  const isPhoneOrSmaller = useBreakpoint('phone');
  const votingInterface = useVoting();
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const currentPhase = getCurrentPhase(phases?.data);
  const [showDataUnsubmittedModal, setShowDataUnsubmittedModal] = useState(
    showModal || false
  );

  const votesCastRef = useRef(votingInterface?.numberOfVotesCast);

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

// TODO - Temp code comment

//     // const unlisten = clHistory.block((action) => {
//   console.log('BLOCKED action: ', action);
//   return true;

// });

// return unlisten;

// if (!basketSubmitted) {
//   clHistory.push = new Proxy(clHistory.push, {
//     apply: (target, thisArg, argArray) => {
//       return target;
//     },
//   });
// } else {
//   clHistory.push = new Proxy(clHistory.push, {
//     apply: (target, thisArg, argArray) => {
//       return target.apply(thisArg, argArray);
//     },
//   });
// }

// useEffect(() => {
//   clHistory.listen((transition) => {
//     console.log({transition});
//     setTimeout(() => {
//       setShowDataUnsubmittedModal(true);
//     }, 2000);
//   });
// });

// useEffect(() => {
//   const unblock = clHistory.block((transition) => {
//     console.log(
//       "in clHistory.block()..."
//     )

//     const allowUrlChange = () => {
//       unblock();
//       transition.retry();
//       return;
//     };

//     if (transition.action === 'REPLACE' || transition.action === 'POP' || basketSubmitted) {
//       console.log('REPLACE, POP, or BASKET SUBMITTED');
//       allowUrlChange();
//     } else {
//       // If the current URL is a project page and we are redirecting to an idea page, allow it.
//       if (
//         location.pathname.includes(
//           `/projects/${project?.data.attributes.slug}`
//         ) &&
//         transition.location.pathname.includes('/ideas/')
//       ) {
//         console.log('PROJECT --> IDEA');
//         allowUrlChange();
//       }

//       // If the current URL is an idea page and we are redirecting to the main project page, allow it.
//       else if (
//         location.pathname.includes('/ideas/') &&
//         transition.location.pathname.includes(
//           `/projects/${project?.data.attributes.slug}`
//         )
//       ) {
//         console.log('IDEA --> PROJECT');
//         allowUrlChange();
//       }

//       // If the basket has no votes in it, allow it.
//       else if (
//         votesCastRef.current === undefined ||
//         votesCastRef.current === 0 ||
//         basket?.data.attributes.total_votes === 0
//       ) {
//         console.log('NO VOTES');
//         allowUrlChange();
//       }
//       // Otherwise, trigger the modal asking the user to submit their votes first, with an option to still redirect.
//       console.log('SHOW MODAL');
//       console.log({transition});
//       console.log(location.pathname);
//       setShowDataUnsubmittedModal(true);
//     }
//   });

//   return function cleanup() {
//     unblock();
//   };
// }, [
//   basket?.data.attributes.total_votes,
//   basketSubmitted,
//   location.pathname,
//   project,
// ]);
