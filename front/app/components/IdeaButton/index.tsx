import React, { memo } from 'react';

import Tippy from '@tippyjs/react';
import { stringify } from 'qs';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import { IPhaseData, ParticipationMethod } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { getInputTerm } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';

import Button, { Props as ButtonProps } from 'components/UI/Button';

import { getIdeaPostingRules } from 'utils/actionTakingRules';
import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { getInputTermMessage } from 'utils/i18n';

import messages from './messages';
import TippyContent from './TippyContent';
import tracks from './tracks';

const Container = styled.div``;

const ButtonWrapper = styled.div``;

export interface Props extends Omit<ButtonProps, 'onClick'> {
  id?: string;
  projectId: string;
  latLng?: GeoJSON.Point | null;
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
    const localize = useLocalize();

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

      const positionParams = latLng
        ? { lat: latLng.coordinates[1], lng: latLng.coordinates[0] }
        : {};

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
              {participationMethod === 'native_survey' ? (
                <>{localize(phase.attributes.native_survey_button_multiloc)}</>
              ) : (
                <FormattedMessage
                  {...getInputTermMessage(getInputTerm(phases?.data), {
                    idea: messages.submitYourIdea,
                    option: messages.addAnOption,
                    project: messages.addAProject,
                    question: messages.addAQuestion,
                    issue: messages.submitAnIssue,
                    contribution: messages.addAContribution,
                  })}
                />
              )}
            </Button>
          </ButtonWrapper>
        </Tippy>
      </Container>
    );
  }
);

export default IdeaButton;
