import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import clHistory from 'utils/cl-router/history';

// typings
import { IParticipationContextType } from 'typings';

// services
import { getIdeaPostingRules, DisabledReasons } from 'services/ideaPostingRules';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// components
import Button, { ButtonContainerProps } from 'components/UI/Button';
import Tippy from '@tippy.js/react';
import Icon from 'components/UI/Icon';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// utils
import { openSignUpInModal } from 'components/SignUpIn/events';

// events
import { openVerificationModal } from 'components/Verification/verificationModalEvents';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// styling
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

const Container = styled.div``;

const ButtonWrapper = styled.div``;

const TooltipContent = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
`;

const TooltipContentIcon = styled(Icon)`
  flex: 0 0 25px;
  width: 20px;
  height: 25px;
  margin-right: 1rem;
`;

const TooltipContentText = styled.div`
  flex: 1 1 auto;
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  text-rendering: optimizeLegibility;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;

  a, button {
    color: ${colors.clBlueDark};
    font-size: ${fontSizes.base}px;
    line-height: normal;
    font-weight: 400;
    text-align: left;
    text-decoration: underline;
    white-space: normal;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-all;
    word-break: break-word;
    hyphens: auto;
    display: inline;
    padding: 0px;
    margin: 0px;
    cursor: pointer;
    transition: all 100ms ease-out;

    &:hover {
      color: ${darken(0.15, colors.clBlueDark)};
      text-decoration: underline;
    }
  }
`;

interface DataProps {
  project: GetProjectChildProps;
  phase: GetPhaseChildProps;
  authUser: GetAuthUserChildProps;
}

interface InputProps extends ButtonContainerProps {
  projectId?: string | undefined | null;
  phaseId?: string | undefined | null;
  className?: string;
  participationContextType: IParticipationContextType | null;
}

interface Props extends InputProps, DataProps {}

interface State {}

class IdeaButton extends PureComponent<Props & InjectedIntlProps, State> {
  locationRef = window.location.href;

  disabledMessages: { [key in DisabledReasons]: ReactIntl.FormattedMessage.MessageDescriptor } = {
    notPermitted: messages.postingNotPermitted,
    maybeNotPermitted: messages.postingMaybeNotPermitted,
    postingDisabled: messages.postingHereImpossible,
    projectInactive: messages.postingProjectInactive,
    notActivePhase: messages.postingNotActivePhase,
    futureEnabled: messages.postingHereImpossible,
    notVerified: messages.postingNotVerified
  };

  onClick = (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

    trackEventByName(tracks.postYourIdeaButtonClicked);

    // if no external onClick handler is defined through the props
    if (!this.props.onClick) {
      const { project, authUser, participationContextType, phaseId, projectId } = this.props;
      const pcType = participationContextType;
      const pcId = pcType === 'phase' ? phaseId : projectId;
      const postingDisabledReason = !isNilOrError(project) ? project.attributes.action_descriptor.posting.disabled_reason : null;

      // if not logged in
      if (isNilOrError(authUser) && !isNilOrError(project)) {
        this.signUp();
      }

      // if logged in but not verified and verification required
      if (!isNilOrError(authUser) && postingDisabledReason === 'not_verified' && pcType && pcId) {
        this.verify();
      }

      // if logegd in and posting allowed
      if (!isNilOrError(authUser) && !isNilOrError(project) && !postingDisabledReason) {
        trackEventByName(tracks.redirectedToIdeaFrom);
        clHistory.push(`/projects/${project.attributes.slug}/ideas/new`);
      }
    } else {
      trackEventByName(tracks.externalHandling);
      this.props.onClick(event);
    }
  }

  signIn = (event?: React.MouseEvent) => {
    this.signUpIn('signin')(event);
  }

  signUp = (event?: React.MouseEvent) => {
    this.signUpIn('signup')(event);
  }

  signUpIn = (flow: 'signup' | 'signin') => (event?: React.MouseEvent) => {
    event?.preventDefault();

    const { project, authUser, participationContextType, phaseId, projectId } = this.props;
    const pcType = participationContextType;
    const pcId = pcType === 'phase' ? phaseId : projectId;
    const postingDisabledReason = !isNilOrError(project) ? project.attributes.action_descriptor.posting.disabled_reason : null;

    if (isNilOrError(authUser) && !isNilOrError(project)) {
      trackEventByName(tracks.signUpInModalOpened);
      openSignUpInModal({
        flow,
        verification: postingDisabledReason === 'not_verified',
        verificationContext: !!(postingDisabledReason === 'not_verified' && pcId && pcType) ? {
          action: 'posting',
          id: pcId,
          type: pcType
        } : undefined,
        action: () => clHistory.push(`/projects/${project.attributes.slug}/ideas/new`)
      });
    }
  }

  verify = (event?: React.MouseEvent) => {
    event?.preventDefault();

    const { participationContextType, projectId, phaseId } = this.props;
    const pcType = participationContextType;
    const pcId = pcType === 'phase' ? phaseId : projectId;

    if (pcId && pcType) {
      trackEventByName(tracks.verificationModalOpened);
      openVerificationModal({
        context: {
          action: 'posting',
          id: pcId,
          type: pcType
        }
      });
    }
  }

  render() {
    const { project, phase, authUser, className, intl: { formatMessage } } = this.props;
    const { show, enabled, disabledReason } = getIdeaPostingRules({ project, phase, authUser });

    const verificationLink = (
      <a href="" role="button" onClick={this.verify}>
        {formatMessage(messages.verificationLinkText)}
      </a>
    );

    const signUpLink = (
      <a href="" role="button" onClick={this.signUp}>
        {formatMessage(messages.signUpLinkText)}
      </a>
    );

    const signInLink = (
      <a href="" role="button" onClick={this.signIn}>
        {formatMessage(messages.signInLinkText)}
      </a>
    );

    if (show) {
      const isSignedIn = !isNilOrError(authUser);
      const isDisabled = isSignedIn ? !!disabledReason : (!!disabledReason && disabledReason !== 'notVerified');
      const tippyContent = (!enabled && !!disabledReason) ? (
        <TooltipContent id="tooltip-content" className="e2e-disabled-tooltip">
          <TooltipContentIcon name="lock-outlined" ariaHidden />
          <TooltipContentText>
            <FormattedMessage {...this.disabledMessages[disabledReason]} values={{ verificationLink, signUpLink, signInLink }} />
          </TooltipContentText>
        </TooltipContent>
      ) : <></>;

      return (
        <Container className={className || ''}>
          <Tippy
            enabled={isDisabled}
            interactive={true}
            placement="bottom"
            content={tippyContent}
            theme="light"
            hideOnClick={false}
          >
            <ButtonWrapper
              tabIndex={isDisabled ? 0 : -1}
              className={`e2e-idea-button ${isDisabled ? 'disabled' : ''} ${disabledReason ? disabledReason : ''}`}
            >
              <Button
                {...this.props}
                aria-describedby="tooltip-content"
                onClick={this.onClick}
                disabled={isDisabled}
                ariaDisabled={false}
              >
                <FormattedMessage {...messages.startAnIdea} />
              </Button>
            </ButtonWrapper>
          </Tippy>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  project: ({ projectId, render, }) => <GetProject projectId={projectId}>{render}</GetProject>,
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>
});

const IdeaButtonWithHoC = injectIntl(IdeaButton);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <IdeaButtonWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
