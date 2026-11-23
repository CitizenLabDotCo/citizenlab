import React from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import usePhase from 'api/phases/usePhase';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';

import PageNotFound from 'components/PageNotFound';
import Unauthorized from 'components/Unauthorized';
import VerticalCenterer from 'components/VerticalCenterer';

import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { getIdeaPostingRules } from 'utils/actionTakingRules';
import Navigate from 'utils/cl-router/Navigate';
import { isUnauthorizedRQ } from 'utils/errorUtils';
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
  const { data: phaseData, status: phaseStatus } = usePhase(phaseId);

  /*
    TO DO: simplify these loading & auth checks, then if possible abstract and use the same the IdeasNewSurveyPage
  */

  if (projectStatus === 'pending' || phaseStatus === 'pending') {
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

  // Fetched by id rather than taken from the project's phase list, because
  // that list only holds timeline phases and leaves out standalone ones.
  const phase = phaseData?.data;

  if (!phase || phase.relationships.project.data.id !== project.data.id) {
    return <PageNotFound />;
  }

  const participationMethod = phase.attributes.participation_method;

  // Survey phases have their own route and form.
  if (participationMethod === 'native_survey') {
    return (
      <Navigate
        to="/projects/$slug/surveys/new/$phaseId"
        params={{ slug, phaseId }}
        replace
      />
    );
  }

  const { show, enabled, disabledReason, authenticationRequirements } =
    getIdeaPostingRules({
      project: project.data,
      phase,
      authUser: authUser?.data,
    });

  // `show` is false when the phase has submissions switched off.
  if (!show) {
    return <Unauthorized />;
  }

  if (enabled === 'maybe' || disabledReason) {
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
          authenticationRequirements !== null ||
          isFixableByAuthentication(disabledReason)
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
