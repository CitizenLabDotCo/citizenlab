import React from 'react';

import { Box, Title, Icon, colors } from '@citizenlab/cl2-component-library';

import useCustomPages from 'api/custom_pages/useCustomPages';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';

interface Props {
  projectId: string;
  projectSlug: string;
}

const ProjectPages = ({ projectId, projectSlug }: Props) => {
  const localize = useLocalize();
  const { data: pages } = useCustomPages({ projectId });

  if (!pages || pages.data.length === 0) {
    return null;
  }

  return (
    <Box>
      <Title variant="h3" color="tenantText" mb="8px">
        <FormattedMessage {...messages.projectPagesTitle} />
      </Title>
      <Box display="flex" flexDirection="column" gap="8px">
        {pages.data.map((page) => (
          <Link
            key={page.id}
            to="/projects/$slug/pages/$pageSlug"
            params={{ slug: projectSlug, pageSlug: page.attributes.slug }}
          >
            <Box display="flex" alignItems="center" gap="8px">
              <Icon
                name="file"
                fill={colors.coolGrey600}
                width="20px"
                height="20px"
              />
              {localize(page.attributes.title_multiloc)}
            </Box>
          </Link>
        ))}
      </Box>
    </Box>
  );
};

export default ProjectPages;
