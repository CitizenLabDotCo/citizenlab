import React from 'react';

import { SectionDescription, SectionTitle } from 'components/admin/Section';
import Highlighter from 'components/Highlighter';

import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from '../messages';

import ProjectDiscoverability from './ProjectDiscoverability';
import ProjectManagementSection from './ProjectManagementSection';
import ProjectVisibility from './ProjectVisibility';

export const projectVisibilityFragmentId = 'project-visibility';

const ProjectPermissions = () => {
  const { projectId } = useParams({
    from: '/$locale/admin/projects/$projectId/general/access-rights',
  });
  if (!projectId) return null;

  return (
    <>
      <SectionTitle>
        <FormattedMessage {...messages.projectVisibilityTitle} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.projectVisibilitySubtitle} />
      </SectionDescription>
      <ProjectDiscoverability projectId={projectId} />
      <Highlighter fragmentId={projectVisibilityFragmentId}>
        <ProjectVisibility projectId={projectId} />
      </Highlighter>
      <ProjectManagementSection projectId={projectId} />
    </>
  );
};

export default ProjectPermissions;
