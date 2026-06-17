import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import Link from 'utils/cl-router/Link';

interface Props {
  projectId: string;
}

// Shown at the top of a project-scoped page so visitors can navigate back to
// the project the page belongs to. The link label is the project's own title.
const BackToProjectLink = ({ projectId }: Props) => {
  const localize = useLocalize();
  const { data: project } = useProjectById(projectId);

  if (!project) {
    return null;
  }

  return (
    <Box display="flex" alignItems="center" gap="4px">
      <Link
        to="/projects/$slug"
        params={{ slug: project.data.attributes.slug }}
      >
        <Text
          as="span"
          m="0"
          color="tenantText"
          fontWeight="normal"
          textDecoration="underline"
        >
          {localize(project.data.attributes.title_multiloc)}
        </Text>
      </Link>
      <Icon
        name="chevron-right"
        width="16px"
        height="16px"
        fill={colors.tenantText}
      />
    </Box>
  );
};

export default BackToProjectLink;
