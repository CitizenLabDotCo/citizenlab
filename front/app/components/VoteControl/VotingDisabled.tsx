import React, { MouseEvent, memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Link from 'utils/cl-router/Link';

// services
import { IIdeaData } from 'services/ideas';
import { IParticipationContextType } from 'typings';

// hooks
import useProject from 'hooks/useProject';
import useAuthUser from 'hooks/useAuthUser';

// i18n
import messages from './messages';
import T from 'components/T';
import { FormattedDate } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { openVerificationModal } from 'components/Verification/verificationModalEvents';

// styling
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

const Container = styled.div`
  width: 100%;
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 300;
  line-height: 20px;

  > span {
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    hyphens: auto;
  }
`;

const StyledLink = styled(Link)`
  color: ${colors.clBlueDark};
  text-decoration: underline;

  &:hover {
    color: ${darken(0.15, colors.clBlueDark)};
    text-decoration: underline;
  }
`;

const StyledButton = styled.button`
  color: ${colors.clBlueDark};
  text-decoration: underline;
  transition: all 80ms ease-out;
  display: inline-block;
  margin: 0;
  padding: 0;
  cursor: pointer;

  &:hover {
    color: ${darken(0.15, colors.clBlueDark)};
    text-decoration: underline;
  }
`;

interface Props {
  projectId: string;
  votingDescriptor: IIdeaData['attributes']['action_descriptor']['voting_idea'];
}

const VotingDisabled = memo(({ projectId, votingDescriptor }: Props) => {
  const project = useProject({ projectId });
  const authUser = useAuthUser();

  const onVerify = (
    pcType: IParticipationContextType,
    // it's theoretically possible to have a timeline project
    // with no phases, in which case we would have no phase id
    pcId: string | undefined
  ) => (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (pcId && pcType) {
      openVerificationModal({
        context: {
          action: 'voting_idea',
          id: pcId,
          type: pcType,
        },
      });
    }
  };

  const removeFocus = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  const reasonToMessage = () => {
    const { disabled_reason, future_enabled } = votingDescriptor;

    if (disabled_reason === 'project_inactive') {
      return future_enabled
        ? messages.votingPossibleLater
        : messages.votingDisabledProjectInactive;
    } else if (disabled_reason === 'voting_disabled' && future_enabled) {
      return messages.votingPossibleLater;
    } else if (disabled_reason === 'voting_limited_max_reached') {
      return messages.votingDisabledMaxReached;
    } else if (disabled_reason === 'idea_not_in_current_phase') {
      return future_enabled
        ? messages.votingDisabledFutureEnabled
        : messages.votingDisabledPhaseOver;
    } else if (disabled_reason === 'not_permitted') {
      return messages.votingNotPermitted;
    } else if (authUser && disabled_reason === 'not_verified') {
      return messages.votingNotVerified;
    } else {
      return messages.votingNotEnabled;
    }
  };

  const stopPropagation = (event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation();
  };

  if (!isNilOrError(project)) {
    const getProjectLink = () => {
      const projectTitle = project.attributes.title_multiloc;

      return (
        <StyledLink
          to={`/projects/${project.attributes.slug}`}
          onClick={stopPropagation}
        >
          <T value={projectTitle} />
        </StyledLink>
      );
    };
    const message = reasonToMessage();
    const enabledFromDate = votingDescriptor.future_enabled ? (
      <FormattedDate
        value={votingDescriptor.future_enabled}
        year="numeric"
        month="long"
        day="numeric"
      />
    ) : null;
    const projectName = getProjectLink();
    const pcType =
      project.attributes.process_type === 'continuous' ? 'project' : 'phase';
    const pcId =
      pcType === 'project'
        ? project.id
        : project.relationships?.current_phase?.data?.id;
    const verificationLink = (
      <StyledButton
        className="e2e-verify-button"
        onClick={onVerify(pcType, pcId)}
        onMouseDown={removeFocus}
      >
        <FormattedMessage {...messages.linkToVerificationText} />
      </StyledButton>
    );

    return (
      <Container data-testid="votingDisabled_Container">
        <FormattedMessage
          {...message}
          values={{
            enabledFromDate,
            projectName,
            verificationLink,
          }}
        />
      </Container>
    );
  }

  return null;
});

export default VotingDisabled;
