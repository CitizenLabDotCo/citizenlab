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
import Navigate from 'utils/cl-router/Navigate';
import { getParticipationMethod } from 'utils/configs/participationMethodConfig';
import { isUnauthorizedRQ } from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';

import IdeasNewIdeationForm from './IdeasNewIdeationForm';

const IdeasNewPage = () => {
  const { slug } = useParams();
  const {
    data: project,
    status: projectStatus,
    error: projectError,
  } = useProjectBySlug(slug);
  const { data: authUser } = useAuthUser();
  const { data: phases, status: phasesStatus } = usePhases(project?.data.id);
  const [searchParams] = useSearchParams();
  const phaseIdFromSearchParams = searchParams.get('phase_id');
  // If we reach this component by hitting ideas/new directly, without a phase_id,
  // we'll still get to this component, so we try to get the phase id from getCurrentPhase.
  const phaseId = phaseIdFromSearchParams || getCurrentPhase(phases?.data)?.id;

  /*
    TO DO: simplify these loading & auth checks, then if possible abstract and use the same the IdeasNewSurveyPage
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
  const participationMethod = getParticipationMethod(
    project.data,
    phases.data,
    // No particular reason why this needs to be phaseIdFromSearchParams,
    // I just wanted to keep this part as it was while refactoring some other parts
    // to reduce the chances of introducing bugs. But it could probably be phaseId instead.
    phaseIdFromSearchParams || undefined
  );
  const { enabled, disabledReason, authenticationRequirements } =
    getIdeaPostingRules({
      project: project.data,
      phase: currentPhase,
      authUser: authUser?.data,
    });

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

  /*
    We arrive in this component via the /ideas/new route, which in the past
    was also used to render the survey form. In order for old links to surveys not to break,
    we are redirecting /ideas/new requests to the new /surveys/new URL. This code can be removed
    once we've verified all surveys started before the date this got merged have been completed.
  */
  if (participationMethod === 'native_survey' && typeof phaseId === 'string') {
    return (
      <Navigate
        to={`/projects/${slug}/surveys/new?phase_id=${phaseId}`}
        replace
      />
    );
  }

  return (
    <IdeasNewIdeationForm
      project={project}
      phaseId={phaseId}
      participationMethod={participationMethod}
    />
  );
};

export default IdeasNewPage;
