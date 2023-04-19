import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';

// typings
import { IParticipationContextType } from 'typings';

// services
import {
  getIdeaPostingRules,
  IIdeaPostingDisabledReason,
} from 'services/actionTakingRules';
import { getInputTerm } from 'services/participationContexts';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// components
import Button, { Props as ButtonProps } from 'components/UI/Button';
import Tippy from '@tippyjs/react';
import { Icon } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps, MessageDescriptor } from 'react-intl';
import messages from './messages';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// styling
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

// typings
import { LatLng } from 'leaflet';
import { getButtonMessage } from './utils';
import { IPhaseData } from 'services/phases';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';

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
  phases: GetPhasesChildProps;
  authUser: GetAuthUserChildProps;
}

interface InputProps extends Omit<ButtonProps, 'onClick'> {
  id?: string;
  projectId: string;
  latLng?: LatLng | null;
  inMap?: boolean;
  className?: string;
  participationContextType: IParticipationContextType;
  buttonText?: MessageDescriptor;
  phase: IPhaseData | undefined | null;
}

interface Props extends InputProps, DataProps {}

const IdeaButton = memo<Props & WrappedComponentProps>(
  ({
    id,
    project,
    phases,
    authUser,
    participationContextType,
    projectId,
    inMap,
    className,
    latLng,
    buttonText,
    phase,
    intl: { formatMessage },
    ...buttonContainerProps
  }) => {
    const disabledMessages: {
      [key in IIdeaPostingDisabledReason]: MessageDescriptor;
    } = {
      notPermitted: messages.postingNoPermission,
      postingDisabled: messages.postingDisabled,
      postingLimitedMaxReached: messages.postingLimitedMaxReached,
      projectInactive: messages.postingInactive,
      futureEnabled: messages.postingNotYetPossible,
      notActivePhase: messages.postingInNonActivePhases,
      maybeNotPermitted: messages.postingMayNotBePermitted,
    };
    const { enabled, show, disabledReason, authenticationRequirements } =
      getIdeaPostingRules({
        project,
        phase,
        authUser,
      });

    const pcType = participationContextType;
    const pcId = pcType === 'phase' ? phase?.id : projectId;

    const context = pcId
      ? ({
          action: 'posting_idea',
          id: pcId,
          type: pcType,
        } as const)
      : null;

    const redirectToIdeaForm = () => {
      if (!isNilOrError(project)) {
        trackEventByName(tracks.redirectedToIdeaFrom);

        const positionParams = latLng
          ? { lat: latLng.lat, lng: latLng.lng }
          : {};

        clHistory.push({
          pathname: `/projects/${project.attributes.slug}/ideas/new`,
          search: stringify(
            {
              ...positionParams,
              phase_id: phase?.id,
            },
            { addQueryPrefix: true }
          ),
        });
      }
    };

    if (isNilOrError(project)) return null;

    const onClick = (event: React.MouseEvent) => {
      event.preventDefault();

      trackEventByName(tracks.postYourIdeaButtonClicked);

      if (authenticationRequirements) {
        signUp();
        return;
      }

      // if logegd in and posting allowed
      if (enabled === true) {
        redirectToIdeaForm();
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

        const successAction: SuccessAction = {
          name: 'redirectToIdeaForm',
          params: {
            projectSlug: project.attributes.slug,
          },
        };

        if (context) {
          trackEventByName(tracks.signUpInModalOpened);

          triggerAuthenticationFlow({
            flow,
            context,
            successAction,
          });
        }
      };

    const verificationLink = (
      <button onClick={signUp}>
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

      const inputTerm = getInputTerm(
        project.attributes.process_type,
        project,
        phases
      );

      const buttonMessage = getButtonMessage(
        phase?.attributes.participation_method ||
          project.attributes.participation_method,
        buttonText,
        inputTerm
      );

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
                id="e2e-idea-button"
              >
                <FormattedMessage {...buttonMessage} />
              </Button>
            </ButtonWrapper>
          </Tippy>
        </Container>
      );
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
});

const IdeaButtonWithHoC = injectIntl(IdeaButton);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <IdeaButtonWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
