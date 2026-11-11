import React from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';

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
import { getParticipationMethod } from 'utils/configs/participationMethodConfig';
import { isUnauthorizedRQ } from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';
import { useParams } from 'utils/router';

import IdeasNewIdeationForm from './IdeasNewIdeationForm';

const IdeasNewPage = () => {
  const { slug, phaseId } = useParams({
    from: '/$locale/projects/$slug/ideas/new/$phaseId',
  });
  const {
    data: project,
    status: projectStatus,
    error: projectError,
  } = useProjectBySlug(slug);
  const { data: authUser } = useAuthUser();
  const { data: phases, status: phasesStatus } = usePhases(project?.data.id);

  /*
    TO DO: simplify these loading & auth checks, then if possible abstract and use the same the IdeasNewSurveyPage
  */

  if (projectStatus === 'pending' || phasesStatus === 'pending') {
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
    phaseId
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

  return (
    <IdeasNewIdeationForm
      project={project}
      phaseId={phaseId}
      participationMethod={participationMethod}
    />
  );
};

export default IdeasNewPage;
