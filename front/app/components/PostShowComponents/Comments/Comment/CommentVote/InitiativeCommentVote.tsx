import React, { useMemo } from 'react';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useInitiativesPermissions from 'hooks/useInitiativesPermissions';
import useInitiativeById from 'api/initiatives/useInitiativeById';

// components
import UpvoteButton from './UpvoteButton';

// events
import { openSignUpInModal } from 'events/openSignUpInModal';
import { openVerificationModal } from 'events/verificationModal';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  className?: string;
  initiativeId: string;
}

const InitiativeCommentVote = ({ className, initiativeId }: Props) => {
  const authUser = useAuthUser();
  const votingPermissions = useInitiativesPermissions(
    'comment_voting_initiative'
  );
  const { data: initiative } = useInitiativeById(initiativeId);

  const vote = useMemo(() => {
    // TODO
    return () => {};
  }, []);

  const handleVoteClick = useMemo(() => {
    if (isNilOrError(authUser)) return null;
    if (isNilOrError(votingPermissions)) return null;
    if (vote === null) return null;

    return (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      const { authenticationRequirements, enabled } = votingPermissions;

      const context = {
        action: 'commenting_initiative',
        type: 'initiative',
      } as const;

      if (authenticationRequirements === 'sign_in_up') {
        openSignUpInModal({
          context,
          onSuccess: () => vote(),
        });
      } else if (authenticationRequirements === 'complete_registration') {
        openSignUpInModal({
          context,
          onSuccess: () => vote(),
        });
      } else if (authenticationRequirements === 'sign_in_up_and_verify') {
        openSignUpInModal({
          verification: true,
          context,
          onSuccess: () => vote(),
        });
      } else if (authenticationRequirements === 'verify') {
        openVerificationModal({ context });
      } else if (enabled === true) {
        vote();
      }
    };
  }, [authUser, votingPermissions, vote]);

  if (!votingPermissions || !initiative || !handleVoteClick) return null;

  const disabled = !votingPermissions.enabled;

  return (
    <UpvoteButton
      className={className}
      disabled={disabled}
      onClick={handleVoteClick}
    />
  );
};

export default InitiativeCommentVote;
