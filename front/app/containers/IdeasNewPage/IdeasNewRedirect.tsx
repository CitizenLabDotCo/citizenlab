import React from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';

import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import PageNotFound from 'components/PageNotFound';
import Unauthorized from 'components/Unauthorized';
import VerticalCenterer from 'components/VerticalCenterer';

import Navigate from 'utils/cl-router/Navigate';
import { getParticipationMethod } from 'utils/configs/participationMethodConfig';
import { isUnauthorizedRQ } from 'utils/errorUtils';
import { useParams, useSearch } from 'utils/router';

// Idea links shared before the phase moved into the path still work:
// `?phase_id=` becomes the path segment, and a link without any phase opens
// the project's current phase. This route also rendered surveys in the past,
// so survey phases go to the survey route.
const IdeasNewRedirect = () => {
  const { slug } = useParams({ from: '/$locale/projects/$slug/ideas/new' });
  const { phase_id, ...search } = useSearch({
    from: '/$locale/projects/$slug/ideas/new',
  });
  const {
    data: project,
    status: projectStatus,
    error: projectError,
  } = useProjectBySlug(slug);
  const { data: phases } = usePhases(project?.data.id);

  if (projectStatus === 'error') {
    return isUnauthorizedRQ(projectError) ? <Unauthorized /> : <PageNotFound />;
  }

  if (!project || !phases) {
    return (
      <VerticalCenterer>
        <Spinner />
      </VerticalCenterer>
    );
  }

  const phaseId = phase_id ?? getCurrentPhase(phases.data)?.id;

  if (!phaseId) {
    return <PageNotFound />;
  }

  const participationMethod = getParticipationMethod(
    project.data,
    phases.data,
    phaseId
  );

  if (participationMethod === 'native_survey') {
    return (
      <Navigate
        to="/projects/$slug/surveys/new/$phaseId"
        params={{ slug, phaseId }}
        replace
      />
    );
  }

  return (
    <Navigate
      to="/projects/$slug/ideas/new/$phaseId"
      params={{ slug, phaseId }}
      search={search}
      replace
    />
  );
};

export default IdeasNewRedirect;
