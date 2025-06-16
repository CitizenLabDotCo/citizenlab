import React, { memo } from 'react';

import { Tooltip, Box } from '@citizenlab/cl2-component-library';
import { stringify } from 'qs';

import useAuthUser from 'api/me/useAuthUser';
import { IPhaseData, ParticipationMethod } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { getInputTerm } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';

import Button, { Props as ButtonProps } from 'components/UI/ButtonWithLink';

import { getIdeaPostingRules } from 'utils/actionTakingRules';
import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { getInputTermMessage } from 'utils/i18n';

import messages from './messages';
import TippyContent from './TippyContent';
import tracks from './tracks';

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
    ...buttonProps
  }) => {
    const { data: project } = useProjectById(projectId);
    const { data: phases } = usePhases(projectId);
    const { data: authUser } = useAuthUser();
    const localize = useLocalize();
    const isNativeSurvey = participationMethod === 'native_survey';

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
          pathname: isNativeSurvey
            ? `/projects/${project.data.attributes.slug}/surveys/new`
            : `/projects/${project.data.attributes.slug}/ideas/new`,
          search: stringify(
            {
              ...positionParams,
              phase_id: phase.id,
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
        signIn();
        return;
      }

      // if logged in and posting allowed
      if (enabled === true) {
        redirectToIdeaForm();
      }
    };

    const signIn = (event?: React.MouseEvent) => {
      signUpIn('signin')(event);
    };

    const signUpIn =
      (flow: 'signup' | 'signin') => (event?: React.MouseEvent) => {
        event?.preventDefault();

        const successAction: SuccessAction = {
          name: 'redirectToIdeaForm',
          params: {
            projectSlug: project.data.attributes.slug,
            phaseId: phase.id,
          },
        };

        trackEventByName(tracks.signUpInModalOpened);

        triggerAuthenticationFlow(
          {
            context,
            successAction,
          },
          flow
        );
      };

    const tippyEnabled = !enabled && !!disabledReason;

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (inMap && !enabled && !!disabledReason) {
      return (
        <TippyContent
          projectId={projectId}
          inMap={inMap}
          disabledReason={disabledReason}
        />
      );
    }

    return (
      <Box id={id} className={className || ''}>
        <Tooltip
          disabled={!tippyEnabled}
          placement="bottom"
          content={
            tippyEnabled ? (
              <TippyContent
                projectId={projectId}
                inMap={inMap}
                disabledReason={disabledReason}
              />
            ) : null
          }
          theme="light"
          hideOnClick={false}
        >
          <Box
            tabIndex={!enabled ? 0 : -1}
            className={`e2e-idea-button ${!enabled ? 'disabled' : ''} ${
              disabledReason ? disabledReason : ''
            }`}
          >
            <Button
              {...buttonProps}
              aria-describedby={
                tippyEnabled ? 'tooltip-content-idea-button' : undefined
              }
              onClick={onClick}
              disabled={!enabled}
            >
              {isNativeSurvey ? (
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
                    proposal: messages.addAProposal,
                    initiative: messages.addAnInitiative,
                    petition: messages.addAPetition,
                  })}
                />
              )}
            </Button>
          </Box>
        </Tooltip>
      </Box>
    );
  }
);

export default IdeaButton;
