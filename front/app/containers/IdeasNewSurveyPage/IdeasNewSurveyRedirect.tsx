import React from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';

import useProjectBySlug from 'api/projects/useProjectBySlug';

import PageNotFound from 'components/PageNotFound';
import Unauthorized from 'components/Unauthorized';
import VerticalCenterer from 'components/VerticalCenterer';

import Navigate from 'utils/cl-router/Navigate';
import { isUnauthorizedRQ } from 'utils/errorUtils';
import { useParams, useSearch } from 'utils/router';

import SurveyNotActiveNotice from './SurveyNotActiveNotice';

// Survey links shared before the phase moved into the path still work:
// `?phase_id=` becomes the path segment, and a link without any phase opens
// the project's current phase.
const IdeasNewSurveyRedirect = () => {
  const { slug } = useParams({ from: '/$locale/projects/$slug/surveys/new' });
  const { phase_id, ...search } = useSearch({
    from: '/$locale/projects/$slug/surveys/new',
  });
  const {
    data: project,
    status: projectStatus,
    error: projectError,
  } = useProjectBySlug(phase_id ? undefined : slug);

  const phaseId =
    phase_id || project?.data.relationships.current_phase?.data?.id;

  if (phaseId) {
    return (
      <Navigate
        to="/projects/$slug/surveys/new/$phaseId"
        params={{ slug, phaseId }}
        search={search}
        replace
      />
    );
  }

  if (projectStatus === 'error') {
    return isUnauthorizedRQ(projectError) ? <Unauthorized /> : <PageNotFound />;
  }

  if (project) {
    return <SurveyNotActiveNotice project={project.data} />;
  }

  return (
    <VerticalCenterer>
      <Spinner />
    </VerticalCenterer>
  );
};

export default IdeasNewSurveyRedirect;
