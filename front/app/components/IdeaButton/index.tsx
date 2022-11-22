import { stringify } from 'qs';
import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IParticipationContextType } from 'typings';

// services
import {
  getIdeaPostingRules,
  IIdeaPostingDisabledReason,
} from 'services/actionTakingRules';
import { getInputTerm } from 'services/participationContexts';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';

// components
import { Icon } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';
import Button, { Props as ButtonProps } from 'components/UI/Button';

// i18n
import { MessageDescriptor, WrappedComponentProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { getInputTermMessage } from 'utils/i18n';
import messages from './messages';

// utils
import { openSignUpInModal } from 'components/SignUpIn/events';

// events
import { openVerificationModal } from 'components/Verification/verificationModalEvents';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// styling
import { darken } from 'polished';
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// typings
import { LatLng } from 'leaflet';
import { canModerateProject } from 'services/permissions/rules/projectPermissions';

const Container = styled.div``;

const ButtonWrapper = styled.div``;

const TooltipContent = styled.div<{ inMap?: boolean }>`
  display: flex;
  align-items: center;
  padding: ${(props) => (props.inMap ? '0px' : '15px')};
`;

const TooltipContentIcon = styled(Icon)`
  flex: 0 0 24px;
  margin-right: 1rem;
`;

const TooltipContentText = styled.div`
  flex: 1 1 auto;
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  a,
  button {
    color: ${colors.teal};
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
      color: ${darken(0.15, colors.teal)};
      text-decoration: underline;
    }
  }
`;

interface DataProps {
  project: GetProjectChildProps;
  phase: GetPhaseChildProps;
  phases: GetPhasesChildProps;
  authUser: GetAuthUserChildProps;
}

interface InputProps extends Omit<ButtonProps, 'onClick'> {
  id?: string;
  projectId: string;
  phaseId?: string | undefined | null;
  latLng?: LatLng | null;
  inMap?: boolean;
  className?: string;
  participationContextType: IParticipationContextType;
}

interface Props extends InputProps, DataProps {}

const IdeaButton = memo<Props & WrappedComponentProps>(
  ({
    id,
    project,
    phase,
    phases,
    authUser,
    participationContextType,
    phaseId,
    projectId,
    inMap,
    className,
    latLng,
    intl: { formatMessage },
    ...buttonContainerProps
  }) => {
    const disabledMessages: {
      [key in IIdeaPostingDisabledReason]: MessageDescriptor;
    } = {
      notPermitted: messages.postingNoPermission,
      postingDisabled: messages.postingDisabled,
      projectInactive: messages.postingInactive,
      futureEnabled: messages.postingNotYetPossible,
      notActivePhase: messages.postingInNonActivePhases,
      maybeNotPermitted: messages.postingMayNotBePermitted,
    };
    const { enabled, show, disabledReason, action } = getIdeaPostingRules({
      project,
      phase,
      authUser,
    });

    const onClick = (event: React.MouseEvent) => {
      event.preventDefault();

      trackEventByName(tracks.postYourIdeaButtonClicked);

      // if not logged in
      if (action === 'sign_in_up' || action === 'sign_in_up_and_verify') {
        signUp();
      }

      // if logged in but not verified and verification required
      if (action === 'verify') {
        verify();
      }

      // if logegd in and posting allowed
      if (enabled === true) {
        redirectToIdeaForm();
      }
    };

    const redirectToIdeaForm = () => {
      if (!isNilOrError(project)) {
        trackEventByName(tracks.redirectedToIdeaFrom);

        const isUserModerator =
          !isNilOrError(authUser) &&
          canModerateProject(projectId, { data: authUser });

        const parameters =
          phaseId && isUserModerator ? `&phase_id=${phaseId}` : '';

        clHistory.push({
          pathname: `/projects/${project.attributes.slug}/ideas/new`,
          search: latLng
            ? stringify(
                { lat: latLng.lat, lng: latLng.lng },
                { addQueryPrefix: true }
              ).concat(parameters)
            : undefined,
        });
      }
    };

    const verify = (event?: React.MouseEvent) => {
      event?.preventDefault();

      const pcType = participationContextType;
      const pcId = pcType === 'phase' ? phaseId : projectId;

      if (pcId && pcType) {
        trackEventByName(tracks.verificationModalOpened);
        openVerificationModal({
          context: {
            action: 'posting_idea',
            id: pcId,
            type: pcType,
          },
        });
      }
    };

    const signIn = (event?: React.MouseEvent) => {
      signUpIn('signin')(event);
    };

    const signUp = (event?: React.MouseEvent) => {
      signUpIn('signup')(event);
    };

    const signUpIn =
      (flow: 'signup' | 'signin') => (event?: React.MouseEvent) => {
        event?.preventDefault();

        const pcType = participationContextType;
        const pcId = pcType === 'phase' ? phaseId : projectId;
        const shouldVerify = action === 'sign_in_up_and_verify';

        if (isNilOrError(authUser) && !isNilOrError(project)) {
          trackEventByName(tracks.signUpInModalOpened);
          openSignUpInModal({
            flow,
            verification: shouldVerify,
            verificationContext:
              shouldVerify && pcId && pcType
                ? {
                    action: 'posting_idea',
                    id: pcId,
                    type: pcType,
                  }
                : undefined,
            action: () => redirectToIdeaForm(),
          });
        }
      };

    const verificationLink = (
      <button onClick={verify}>
        {formatMessage(messages.verificationLinkText)}
      </button>
    );

    const signUpLink = (
      <button onClick={signUp}>{formatMessage(messages.signUpLinkText)}</button>
    );

    const signInLink = (
      <button onClick={signIn}>{formatMessage(messages.signInLinkText)}</button>
    );

    if (show) {
      const tippyContent =
        !enabled && !!disabledReason ? (
          <TooltipContent
            id="tooltip-content"
            className="e2e-disabled-tooltip"
            inMap={inMap}
          >
            <TooltipContentIcon name="lock" ariaHidden />
            <TooltipContentText>
              <FormattedMessage
                {...disabledMessages[disabledReason]}
                values={{ verificationLink, signUpLink, signInLink }}
              />
            </TooltipContentText>
          </TooltipContent>
        ) : null;

      if (inMap && !enabled && !!disabledReason) {
        return (
          <TooltipContent
            id="tooltip-content"
            className="e2e-disabled-tooltip"
            inMap={inMap}
          >
            <TooltipContentIcon name="lock" ariaHidden />
            <TooltipContentText>
              <FormattedMessage
                {...disabledMessages[disabledReason]}
                values={{ verificationLink, signUpLink, signInLink }}
              />
            </TooltipContentText>
          </TooltipContent>
        );
      }

      if (!isNilOrError(project)) {
        const inputTerm = getInputTerm(
          project.attributes.process_type,
          project,
          phases
        );

        const buttonMessage =
          project.attributes.participation_method === 'native_survey' ||
          phase?.attributes.participation_method === 'native_survey'
            ? messages.takeTheSurvey
            : getInputTermMessage(inputTerm, {
                idea: messages.submitYourIdea,
                option: messages.addAnOption,
                project: messages.addAProject,
                question: messages.addAQuestion,
                issue: messages.submitAnIssue,
                contribution: messages.addAContribution,
              });

        return (
          <Container id={id} className={className || ''}>
            <Tippy
              disabled={!tippyContent}
              interactive={true}
              placement="bottom"
              content={tippyContent || <></>}
              theme="light"
              hideOnClick={false}
            >
              <ButtonWrapper
                id="e2e-cta-button"
                tabIndex={!enabled ? 0 : -1}
                className={`e2e-idea-button ${!enabled ? 'disabled' : ''} ${
                  disabledReason ? disabledReason : ''
                }`}
              >
                <Button
                  {...buttonContainerProps}
                  aria-describedby="tooltip-content"
                  onClick={onClick}
                  disabled={!enabled}
                  ariaDisabled={false}
                >
                  <FormattedMessage {...buttonMessage} />
                </Button>
              </ButtonWrapper>
            </Tippy>
          </Container>
        );
      }
    }

    return null;
  }
);

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  project: ({ projectId, render }) => (
    <GetProject projectId={projectId}>{render}</GetProject>
  ),
  phases: ({ projectId, render }) => (
    <GetPhases projectId={projectId}>{render}</GetPhases>
  ),
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>,
});

const IdeaButtonWithHoC = injectIntl(IdeaButton);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <IdeaButtonWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
