import React from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';

import usePhase from 'api/phases/usePhase';
import useProjectBySlug from 'api/projects/useProjectBySlug';

import PageNotFound from 'components/PageNotFound';
import Unauthorized from 'components/Unauthorized';
import VerticalCenterer from 'components/VerticalCenterer';

import Navigate from 'utils/cl-router/Navigate';
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
  const phaseId =
    phase_id || project?.data.relationships.current_phase?.data?.id;
  // Fetched by id rather than taken from the project's phase list, because
  // that list only holds timeline phases and leaves out standalone ones.
  const { data: phase, status: phaseStatus } = usePhase(phaseId);

  if (projectStatus === 'error') {
    return isUnauthorizedRQ(projectError) ? <Unauthorized /> : <PageNotFound />;
  }

  // No phase in the link and none currently running: nothing is open for
  // posting, which is a permission message rather than a missing page.
  if (project && !phaseId) {
    return <Unauthorized />;
  }

  if (phaseStatus === 'error') {
    return <PageNotFound />;
  }

  if (!phaseId || !phase) {
    return (
      <VerticalCenterer>
        <Spinner />
      </VerticalCenterer>
    );
  }

  const participationMethod = phase.data.attributes.participation_method;

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
