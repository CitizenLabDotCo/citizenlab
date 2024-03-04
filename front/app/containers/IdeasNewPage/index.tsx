import React from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { parse } from 'qs';
import { useParams } from 'react-router-dom';

import PageNotFound from 'components/PageNotFound';
import Unauthorized from 'components/Unauthorized';
import VerticalCenterer from 'components/VerticalCenterer';

import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { getIdeaPostingRules } from 'utils/actionTakingRules';
import { getParticipationMethod } from 'utils/configs/participationMethodConfig';
import { isUnauthorizedRQ } from 'utils/errorUtils';

import { isNilOrError } from 'utils/helperUtils';
import useAuthUser from 'api/me/useAuthUser';
import usePhases from 'api/phases/usePhases';
import useProjectBySlug from 'api/projects/useProjectBySlug';
import SurveySubmittedNotice from './components/SurveySubmittedNotice';
import IdeasNewForm from './IdeasNewForm';

import { getCurrentPhase } from 'api/phases/utils';

const NewIdeaPage = () => {
  const { slug } = useParams();
  const { data: project, status, error } = useProjectBySlug(slug);
  const { data: authUser } = useAuthUser();
  const { data: phases } = usePhases(project?.data.id);
  const { phase_id } = parse(location.search, {
    ignoreQueryPrefix: true,
  }) as { [key: string]: string };

  if (status === 'loading') {
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

  const participationMethod = getParticipationMethod(
    project.data,
    phases?.data,
    phase_id
  );
  const isSurvey = participationMethod === 'native_survey';

  const { enabled, disabledReason, authenticationRequirements } =
    getIdeaPostingRules({
      project: project.data,
      phase: getCurrentPhase(phases?.data),
      authUser: authUser?.data,
    });

  if (isSurvey && disabledReason === 'postingLimitedMaxReached') {
    return <SurveySubmittedNotice project={project.data} />;
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

  return <IdeasNewForm project={project} />;
};

export default NewIdeaPage;
