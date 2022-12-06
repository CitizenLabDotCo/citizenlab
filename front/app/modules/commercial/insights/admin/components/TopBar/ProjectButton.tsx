import React from 'react';
// hooks
import useProject from 'hooks/useProject';
// utils
import { isNilOrError } from 'utils/helperUtils';
// styles
import { fontSizes } from 'utils/styleUtils';
import T from 'components/T';
// components
import Button from 'components/UI/Button';

interface ProjectButtonProps {
  projectId: string;
}

const ProjectButton = ({ projectId }: ProjectButtonProps) => {
  const project = useProject({
    projectId,
  });

  if (isNilOrError(project)) {
    return null;
  }

  return (
    <Button
      buttonStyle="secondary-outlined"
      fontSize={`${fontSizes.s}px`}
      padding="4px 6px"
      linkTo={`/projects/${project.attributes.slug}`}
      data-testid="insightsProjectButton"
      icon="link"
      iconPos="right"
      openLinkInNewTab
      mr="12px"
    >
      <T value={project.attributes.title_multiloc} />
    </Button>
  );
};

export default ProjectButton;
