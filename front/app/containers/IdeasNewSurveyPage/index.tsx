import React, { useState } from 'react';

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
import { isUnauthorizedRQ } from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';
import { useParams, useSearch } from 'utils/router';

import IdeasNewSurveyForm from './IdeasNewSurveyForm';
import SurveyNotActiveNotice from './SurveyNotActiveNotice';
import SurveySubmittedNotice from './SurveySubmittedNotice';

const IdeasNewSurveyPage = () => {
  const { slug } = useParams({ from: '/$locale/projects/$slug/surveys/new' });
  const {
    data: project,
    status: projectStatus,
    error: projectError,
  } = useProjectBySlug(slug);
  const { data: authUser } = useAuthUser();
  const searchParams = useSearch({
    from: '/$locale/projects/$slug/surveys/new',
  });

  // If idea_id is present in the URL when this component first mounts,
  // it means the user is navigating back to a previously submitted survey
  // (via browser back/forward). The idea_id is added via history.replace
  // after submission, so it persists in the browser history entry.
  const [hadIdeaIdOnMount] = useState(() => !!searchParams.idea_id);
  const [hasEntered, setHasEntered] = useState(false);

  // If we reach this component by hitting surveys/new directly, without a phase_id,
  // we fall back to the project's current phase.
  const phaseIdFromSearchParams = searchParams.phase_id;
  const phaseId =
    phaseIdFromSearchParams ||
    project?.data.relationships.current_phase?.data?.id;
  const { data: phase, isInitialLoading: phaseIsLoading } = usePhase(phaseId);

  /*
    TO DO: simplify these loading & auth checks, then if possible abstract and use the same the IdeasNewPage
  */
  if (projectStatus === 'loading' || phaseIsLoading) {
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

  const { enabled, disabledReason, authenticationRequirements } =
    getIdeaPostingRules({
      project: project.data,
      phase: phase?.data,
      authUser: authUser?.data,
    });

  if (!hasEntered) {
    if (disabledReason === 'posting_limited_max_reached' || hadIdeaIdOnMount) {
      return <SurveySubmittedNotice project={project.data} />;
    }

    if (
      disabledReason === 'inactive_phase' ||
      disabledReason === 'project_inactive'
    ) {
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

    // The gate only decides on entry. From here on, the form owns the session.
    setHasEntered(true);
  }

  return <IdeasNewSurveyForm project={project} phaseId={phaseId} />;
};

export default IdeasNewSurveyPage;
