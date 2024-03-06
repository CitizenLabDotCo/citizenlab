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
import { getParticipationMethod } from 'utils/configs/participationMethodConfig';
import { isUnauthorizedRQ } from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';

import SurveySubmittedNotice from './components/SurveySubmittedNotice';
import SurveyNotActiveNotice from './components/SurveyNotActiveNotice';
import IdeasNewIdeationForm from './IdeasNewIdeationForm';
import IdeasNewSurveyForm from './IdeasNewSurveyForm';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

const NewIdeaPage = () => {
  const { slug } = useParams();
  const {
    data: project,
    status: projectStatus,
    error,
  } = useProjectBySlug(slug);
  const { data: authUser } = useAuthUser();
  const { data: phases, status: phasesStatus } = usePhases(project?.data.id);
  const { phase_id } = parse(location.search, {
    ignoreQueryPrefix: true,
  }) as { [key: string]: string };

  if (projectStatus === 'loading' || phasesStatus === 'loading') {
    return (
      <VerticalCenterer>
        <Spinner />
      </VerticalCenterer>
    );
  }

  if (status === 'error') {
    if (isUnauthorizedRQ(error)) {
      return <Unauthorized />;
    }

    return <PageNotFound />;
  }

  if (!phases || !project) {
    return null;
  }

  const currentPhase = getCurrentPhase(phases?.data);
  const participationMethod = getParticipationMethod(
    project.data,
    phases?.data,
    phase_id
  );
  const isSurvey = participationMethod === 'native_survey';

  const { enabled, disabledReason, authenticationRequirements } =
    getIdeaPostingRules({
      project: project.data,
      phase: currentPhase,
      authUser: authUser?.data,
    });

  const userIsModerator =
    !isNilOrError(authUser) &&
    canModerateProject(project.data.id, { data: authUser.data });

  const userCannotViewSurvey =
    !userIsModerator && phase_id !== currentPhase?.id;

  if (isSurvey) {
    if (disabledReason === 'postingLimitedMaxReached') {
      return <SurveySubmittedNotice project={project.data} />;
    } else if (userCannotViewSurvey) {
      return <SurveyNotActiveNotice project={project.data} />;
    }
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

  if (isSurvey) {
    return <IdeasNewSurveyForm project={project} />;
  } else {
    return <IdeasNewIdeationForm project={project} />;
  }
};

export default NewIdeaPage;
