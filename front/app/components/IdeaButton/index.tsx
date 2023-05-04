import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
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

// components
import Button, { Props as ButtonProps } from 'components/UI/Button';
import Tippy from '@tippyjs/react';
import { Icon } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { MessageDescriptor } from 'react-intl';
import messages from './messages';

// utils
import { openSignUpInModal } from 'events/openSignUpInModal';

// events
import { openVerificationModal } from 'events/verificationModal';

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
import useAuthUser from 'hooks/useAuthUser';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';

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

interface Props extends Omit<ButtonProps, 'onClick'> {
  id?: string;
  projectId: string;
  latLng?: LatLng | null;
  inMap?: boolean;
  className?: string;
  participationContextType: IParticipationContextType;
  buttonText?: MessageDescriptor;
  phase: IPhaseData | undefined | null;
}

const IdeaButton = memo<Props>(
  ({
    id,
    participationContextType,
    projectId,
    inMap,
    className,
    latLng,
    buttonText,
    phase,
    ...buttonContainerProps
  }) => {
    const { formatMessage } = useIntl();
    const authUser = useAuthUser();
    const project = useProject({ projectId });
    const phases = usePhases(projectId);
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

      // if logged in and posting allowed
      if (enabled === true) {
        redirectToIdeaForm();
      }
    };

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

    const verify = (event?: React.MouseEvent) => {
      event?.preventDefault();

      const pcType = participationContextType;
      const pcId = pcType === 'phase' ? phase?.id : projectId;

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
        const pcId = pcType === 'phase' ? phase?.id : projectId;
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

export default IdeaButton;
