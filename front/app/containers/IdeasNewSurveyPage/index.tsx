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
  const { phase_id } = parse(location.search, {
    ignoreQueryPrefix: true,
  }) as { [key: string]: string };

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

  const userCannotViewSurvey =
    !canModerateProject(project.data.id, authUser) &&
    phase_id !== currentPhase?.id;

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

  return <IdeasNewSurveyForm project={project} />;
};

export default IdeasNewSurveyPage;
