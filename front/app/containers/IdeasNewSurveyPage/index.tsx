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

  if (!phases) {
    return null;
  }

  const currentPhase = getCurrentPhase(phases.data);

  const { enabled, disabledReason, authenticationRequirements } =
    getIdeaPostingRules({
      project: project.data,
      phase: currentPhase,
      authUser: authUser?.data,
    });

  // Hard to understand why this is needed without context.
  // The phase id checks are also unclear.
  // Please replace this text and add a comment if you know.
  const userCannotViewSurvey =
    !canModerateProject(project.data, authUser) &&
    /* Something I could deduct: when this code was added, we made the (wrong) 
    assumption that `phase_id` was always a string (we were type casting the phase_id param). 
    So I _think_ we are checking here whether phase_id from the search params is differnet from
    currentPhase?.id when both are strings.
    
    I've added back undefined as a fallback, so the check remains the same as when we were using parse
    to get the phase_id from the search params.
    */
    (phaseIdFromSearchParams || undefined) !== currentPhase?.id;

  if (disabledReason === 'posting_limited_max_reached') {
    return <SurveySubmittedNotice project={project.data} />;
  } else if (userCannotViewSurvey) {
    return <SurveyNotActiveNotice project={project.data} />;
  }

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if ((enabled === 'maybe' && authenticationRequirements) || disabledReason) {
    const triggerAuthFlow = () => {
      triggerAuthenticationFlow({
        context: {
          type: 'phase',
          action: 'posting_idea',
          id: phaseId || '',
        },
      });
    };

    const fixableByAuthentication =
      !isNilOrError(authenticationRequirements) ||
      (disabledReason && isFixableByAuthentication(disabledReason)) ||
      false;

    // By default, trigger the modal right away if relevant for better UX.
    if (fixableByAuthentication) {
      triggerAuthFlow();
    }

    return (
      <Unauthorized
        fixableByAuthentication={fixableByAuthentication}
        triggerAuthFlow={triggerAuthFlow}
      />
    );
  }

  return <IdeasNewSurveyForm project={project} phaseId={phaseId} />;
};

export default IdeasNewSurveyPage;
