import React, { MouseEvent, PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import clHistory from 'utils/cl-router/history';

// components
import Link from 'utils/cl-router/Link';

// services
import { IIdeaData } from 'services/ideas';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

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

interface InputProps {
  projectId: string;
  votingDescriptor: IIdeaData['attributes']['action_descriptor']['voting_idea'];
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  project: GetProjectChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class VotingDisabled extends PureComponent<Props, State> {
  onVerify = (event) => {
    event.stopPropagation();
    event.preventDefault();

    const { project } = this.props;

    if (!isNilOrError(project)) {
      const pcType =
        project.attributes.process_type === 'continuous' ? 'project' : 'phase';
      const pcId =
        pcType === 'project'
          ? project.id
          : project.relationships?.current_phase?.data?.id;

      if (pcId && pcType) {
        openVerificationModal({
          context: {
            action: 'voting_idea',
            id: pcId,
            type: pcType,
          },
        });
      }
    }
  };

  removeFocus = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  reasonToMessage = () => {
    const { authUser } = this.props;
    const { disabled_reason, future_enabled } = this.props.votingDescriptor;

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

  handleProjectLinkClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isNilOrError(this.props.project)) {
      clHistory.push(`/projects/${this.props.project.attributes.slug}`);
    }
  };

  getProjectLink = () => {
    const { project } = this.props;

    if (!isNilOrError(project)) {
      const projectTitle = project.attributes.title_multiloc;

      return (
        <StyledLink
          to={`/projects/${project.attributes.slug}`}
          onClick={this.stopPropagation}
        >
          <T value={projectTitle} />
        </StyledLink>
      );
    }

    return null;
  };

  stopPropagation = (event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation();
  };

  render() {
    const { votingDescriptor } = this.props;
    const message = this.reasonToMessage();
    const enabledFromDate = votingDescriptor.future_enabled ? (
      <FormattedDate
        value={votingDescriptor.future_enabled}
        year="numeric"
        month="long"
        day="numeric"
      />
    ) : null;
    const projectName = this.getProjectLink();
    const verificationLink = (
      <StyledButton
        className="e2e-verify-button"
        onClick={this.onVerify}
        onMouseDown={this.removeFocus}
      >
        <FormattedMessage {...messages.linkToVerificationText} />
      </StyledButton>
    );

    return (
      <Container>
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
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  project: ({ projectId, render }) => (
    <GetProject projectId={projectId}>{render}</GetProject>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <VotingDisabled {...inputProps} {...dataProps} />}
  </Data>
);
