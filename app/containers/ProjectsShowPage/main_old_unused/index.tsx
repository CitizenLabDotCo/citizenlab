import { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';
import { getProjectUrl } from 'services/projects';
import useProject from 'hooks/useProject';

const ProjectPageMain = memo<WithRouterProps>(({ params }) => {
  const project = useProject({ projectSlug: params.slug });

  if (!isNilOrError(project)) {
    const redirectUrl = getProjectUrl(project);

    if (window.location.pathname !== redirectUrl) {
      clHistory.replace(redirectUrl);
    }
  }

  return null;
});

const ProjectPageMainWithHoC = withRouter(ProjectPageMain);

export default ProjectPageMainWithHoC;
