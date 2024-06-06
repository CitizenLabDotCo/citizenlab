import React from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';
import { parse } from 'qs';
import { useParams } from 'react-router-dom';

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
  const { phase_id } = parse(location.search, {
    ignoreQueryPrefix: true,
  }) as { [key: string]: string };

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
    phases?.data,
    phase_id
  );
  const { enabled, disabledReason, authenticationRequirements } =
    getIdeaPostingRules({
      project: project.data,
      phase: currentPhase,
      authUser: authUser?.data,
    });

  if ((enabled === 'maybe' && authenticationRequirements) || disabledReason) {
    const triggerAuthFlow = () => {
      triggerAuthenticationFlow({
        flow: 'signup',
        context: {
          type: 'phase',
          action: 'posting_idea',
          id: phase_id || getCurrentPhase(phases?.data)?.id || '',
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
  if (currentPhase && participationMethod === 'native_survey') {
    return (
      <Navigate
        to={`/projects/${slug}/surveys/new?phase_id=${currentPhase.id}`}
        replace
      />
    );
  }

  return <IdeasNewIdeationForm project={project} />;
};

export default IdeasNewPage;
