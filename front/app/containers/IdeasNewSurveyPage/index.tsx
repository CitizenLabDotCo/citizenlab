import React from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';
import { useParams, useSearchParams } from 'react-router-dom';

import useAuthUser from 'api/me/useAuthUser';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';

import PageNotFound from 'components/PageNotFound';
import Unauthorized from 'components/Unauthorized';
import VerticalCenterer from 'components/VerticalCenterer';

import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { getIdeaPostingRules } from 'utils/actionTakingRules';
import { isUnauthorizedRQ } from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import IdeasNewSurveyForm from './IdeasNewSurveyForm';
import SurveyNotActiveNotice from './SurveyNotActiveNotice';
import SurveySubmittedNotice from './SurveySubmittedNotice';

const IdeasNewSurveyPage = () => {
  const { slug } = useParams();
  const {
    data: project,
    status: projectStatus,
    error: projectError,
  } = useProjectBySlug(slug);
  const { data: authUser } = useAuthUser();
  const { data: phases, status: phasesStatus } = usePhases(project?.data.id);
  const [searchParams] = useSearchParams();
  // If we reach this component by hitting surveys/new directly, without a phase_id,
  // we'll still get to this component, so we try to get the phase id from getCurrentPhase.
  const phaseIdFromSearchParams = searchParams.get('phase_id');
  const phaseId = phaseIdFromSearchParams || getCurrentPhase(phases?.data)?.id;

  /*
    TO DO: simplify these loading & auth checks, then if possible abstract and use the same the IdeasNewPage
  */
  if (projectStatus === 'loading' || phasesStatus === 'loading') {
    return (
      <VerticalCenterer>
        <Spinner />
      </VerticalCenterer>
    );
  }

  if (projectStatus === 'error') {
    if (isUnauthorizedRQ(projectError)) {
      return <Unauthorized />;
    }

    return <PageNotFound />;
  }

  if (!phases || !phaseId) {
    return null;
  }

  const currentPhase = getCurrentPhase(phases.data);

  const { enabled, disabledReason, authenticationRequirements } =
    getIdeaPostingRules({
      project: project.data,
      phase: currentPhase,
      authUser: authUser?.data,
    });

  const userCannotViewSurvey =
    // Hard to understand why we do this check without context.
    // Please replace this text and add a comment if you know.
    !canModerateProject(project.data.id, authUser) &&
    phaseIdFromSearchParams !== currentPhase?.id;

  if (disabledReason === 'postingLimitedMaxReached') {
    return <SurveySubmittedNotice project={project.data} />;
  } else if (userCannotViewSurvey) {
    return <SurveyNotActiveNotice project={project.data} />;
  }

  if ((enabled === 'maybe' && authenticationRequirements) || disabledReason) {
    const triggerAuthFlow = () => {
      triggerAuthenticationFlow({
        flow: 'signup',
        context: {
          type: 'phase',
          action: 'posting_idea',
          id: phaseId,
        },
      });
    };

    return (
      <Unauthorized
        fixableByAuthentication={
          !isNilOrError(authenticationRequirements) ||
          (disabledReason && isFixableByAuthentication(disabledReason)) ||
          false
        }
        triggerAuthFlow={triggerAuthFlow}
      />
    );
  }

  return <IdeasNewSurveyForm project={project} />;
};

export default IdeasNewSurveyPage;
