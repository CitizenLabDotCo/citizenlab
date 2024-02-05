import React from 'react';
import { parse } from 'qs';

// components
import { Spinner } from '@citizenlab/cl2-component-library';
import Unauthorized from 'components/Unauthorized';
import PageNotFound from 'components/PageNotFound';
import VerticalCenterer from 'components/VerticalCenterer';
import SurveySubmittedNotice from './components/SurveySubmittedNotice';
import IdeasNewSurveyForm from "./IdeasNewSurveyForm";
import IdeasNewIdeationForm from "./IdeasNewIdeationForm";

// hooks
import useProjectBySlug from 'api/projects/useProjectBySlug';
import usePhases from 'api/phases/usePhases';
import { getParticipationMethod } from 'utils/configs/participationMethodConfig';

// utils
import { isUnauthorizedRQ } from 'utils/errorUtils';
import { useParams } from 'react-router-dom';
import { getIdeaPostingRules } from 'utils/actionTakingRules';
import useAuthUser from 'api/me/useAuthUser';
import { getCurrentPhase } from 'api/phases/utils';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { isNilOrError } from 'utils/helperUtils';

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

  if (isSurvey) {
    return <IdeasNewSurveyForm project={project} />;
  } else {
    return <IdeasNewIdeationForm project={project} />;
  }
};

export default NewIdeaPage;
