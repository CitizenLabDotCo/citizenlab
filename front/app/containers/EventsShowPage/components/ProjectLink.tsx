import React from 'react';

// components
import { Box, Text, Icon, colors } from '@citizenlab/cl2-component-library';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

// router
import Link from 'utils/cl-router/Link';

type ProjectLinkProps = {
  projectTitleLocalized: string;
  projectSlug: string;
};

const ProjectLink = ({
  projectTitleLocalized,
  projectSlug,
}: ProjectLinkProps) => {
  const { formatMessage } = useIntl();

  return (
    <Box display="flex" my="24px" gap="8px">
      <Box h="40px" w="40px" background={colors.grey200} borderRadius="90px">
        <Icon
          name="calendar"
          fill={colors.primary}
          my="auto"
          mx="auto"
          width="100%"
          height="100%"
          p="8px"
        />
      </Box>
      <Box>
        <Text p="0px" m="0px">
          {formatMessage(messages.eventFrom, {
            eventTitle: projectTitleLocalized,
          })}
        </Text>
        <Link to={`/projects/${projectSlug}`}>
          <Text
            fontSize="s"
            p="0px"
            m="0px"
            color="coolGrey600"
            textDecoration="underline"
          >
            {formatMessage(messages.goToProject)}
          </Text>
        </Link>
      </Box>
    </Box>
  );
};

export default ProjectLink;
