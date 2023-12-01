import React, { memo } from 'react';
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';

// typings

// services
import { getIdeaPostingRules } from 'utils/actionTakingRules';

// components
import Button, { Props as ButtonProps } from 'components/UI/Button';
import Tippy from '@tippyjs/react';

// i18n
import { FormattedMessage } from 'utils/cl-intl';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// styling
import styled from 'styled-components';

// typings
import { LatLng } from 'leaflet';
import {IPhaseData, ParticipationMethod} from 'api/phases/types';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import useAuthUser from 'api/me/useAuthUser';
import TippyContent from './TippyContent';
import {getInputTerm} from "api/phases/utils";
import { getInputTermMessage } from 'utils/i18n';
import messages from './messages';


const Container = styled.div``;

const ButtonWrapper = styled.div``;

export interface Props extends Omit<ButtonProps, 'onClick'> {
  id?: string;
  projectId: string;
  latLng?: LatLng | null;
  inMap?: boolean;
  className?: string;
  phase: IPhaseData | undefined;
  participationMethod: Extract<
    ParticipationMethod,
    'ideation' | 'native_survey'
  >;
}

const IdeaButton = memo<Props>(
  ({
    id,
    projectId,
    inMap = false,
    className,
    latLng,
    phase,
    participationMethod,
    ...buttonContainerProps
  }) => {
    const { data: project } = useProjectById(projectId);
    const { data: phases } = usePhases(projectId);
    const { data: authUser } = useAuthUser();

    if (!project || !phase) return null;

    const { enabled, show, disabledReason, authenticationRequirements } =
      getIdeaPostingRules({
        project: project.data,
        phase,
        authUser: authUser?.data,
      });

    if (!show) return null;

    const context = {
      action: 'posting_idea',
      id: phase.id,
      type: 'phase',
    } as const;

    const redirectToIdeaForm = () => {
      trackEventByName(tracks.redirectedToIdeaFrom);

      const positionParams = latLng ? { lat: latLng.lat, lng: latLng.lng } : {};

      clHistory.push(
        {
          pathname: `/projects/${project.data.attributes.slug}/ideas/new`,
          search: stringify(
            {
              ...positionParams,
              phase_id: phase?.id,
            },
            { addQueryPrefix: true }
          ),
        },
        { scrollToTop: true }
      );
    };

    const onClick = (event: React.MouseEvent) => {
      event.preventDefault();

      trackEventByName(tracks.postYourIdeaButtonClicked);

      if (authenticationRequirements) {
        signUp();
        return;
      }

      // if logged in and posting allowed
      if (enabled === true) {
        redirectToIdeaForm();
      }
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
            projectSlug: project.data.attributes.slug,
            phaseId: phase?.id,
          },
        };

        trackEventByName(tracks.signUpInModalOpened);

        triggerAuthenticationFlow({
          flow,
          context,
          successAction,
        });
      };

    const tippyEnabled = !enabled && !!disabledReason;

    if (inMap && !enabled && !!disabledReason) {
      return (
        <TippyContent
          projectId={projectId}
          inMap={inMap}
          disabledReason={disabledReason}
          phase={phase}
        />
      );
    }

    return (
      <Container id={id} className={className || ''}>
        <Tippy
          disabled={!tippyEnabled}
          interactive={true}
          placement="bottom"
          content={
            tippyEnabled ? (
              <TippyContent
                projectId={projectId}
                inMap={inMap}
                disabledReason={disabledReason}
                phase={phase}
              />
            ) : null
          }
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
              <FormattedMessage
                {...(participationMethod === 'native_survey'
                  ? messages.takeTheSurvey
                  : getInputTermMessage(getInputTerm(phases?.data), {
                      idea: messages.submitYourIdea,
                      option: messages.addAnOption,
                      project: messages.addAProject,
                      question: messages.addAQuestion,
                      issue: messages.submitAnIssue,
                      contribution: messages.addAContribution,
                    }))}
              />
            </Button>
          </ButtonWrapper>
        </Tippy>
      </Container>
    );
  }
);

export default IdeaButton;
