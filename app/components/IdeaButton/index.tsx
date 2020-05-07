import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';

// typings
import { IParticipationContextType } from 'typings';

// services
import { getIdeaPostingRules, DisabledReasons } from 'services/ideaPostingRules';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// components
import Button, { ButtonContainerProps } from 'components/UI/Button';
import Tippy from '@tippyjs/react';
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

// typings
import { LatLng } from 'leaflet';

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

  a,
  button {
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

interface InputProps extends Omit<ButtonContainerProps, 'onClick'> {
  projectId?: string | undefined | null;
  phaseId?: string | undefined | null;
  latLng?: LatLng | null;
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

  redirectToIdeaForm = () => {
    const { project, latLng } = this.props;

    if (!isNilOrError(project)) {
      trackEventByName(tracks.redirectedToIdeaFrom);

      clHistory.push({
        pathname: `/projects/${project.attributes.slug}/ideas/new`,
        search: latLng ? stringify({ lat: latLng.lat, lng: latLng.lng }, { addQueryPrefix: true }) : undefined
      });
    }
  }

  onClick = (event: React.FormEvent<HTMLButtonElement>) => {
    event.preventDefault();

    trackEventByName(tracks.postYourIdeaButtonClicked);

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
      this.redirectToIdeaForm();
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
        action: () => this.redirectToIdeaForm()
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
      const isButtonDisabled = isSignedIn ? !!disabledReason : (!!disabledReason && disabledReason !== 'notVerified');
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
            disabled={!isButtonDisabled}
            interactive={true}
            placement="bottom"
            content={tippyContent}
            theme="light"
            hideOnClick={false}
          >
            <ButtonWrapper
              tabIndex={isButtonDisabled ? 0 : -1}
              className={`e2e-idea-button ${isButtonDisabled ? 'disabled' : ''} ${disabledReason ? disabledReason : ''}`}
            >
              <Button
                {...this.props}
                aria-describedby="tooltip-content"
                onClick={this.onClick}
                disabled={isButtonDisabled}
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
