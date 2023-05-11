import React from 'react';

// styles
import { fontSizes } from 'utils/styleUtils';

// components
import Button from 'components/UI/Button';
import T from 'components/T';

// hooks
import useProjectById from 'api/projects/useProjectById';

interface ProjectButtonProps {
  projectId: string;
}

const ProjectButton = ({ projectId }: ProjectButtonProps) => {
  const { data: project } = useProjectById(projectId);

  if (!project) {
    return null;
  }

  return (
    <Button
      buttonStyle="secondary-outlined"
      fontSize={`${fontSizes.s}px`}
      padding="4px 6px"
      linkTo={`/projects/${project.data.attributes.slug}`}
      data-testid="insightsProjectButton"
      icon="link"
      iconPos="right"
      openLinkInNewTab
      mr="12px"
    >
      <T value={project.data.attributes.title_multiloc} />
    </Button>
  );
};

export default ProjectButton;
