import React from 'react';

import {
  Box,
  Text,
  Icon,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from '../messages';

type ProjectLinkProps = {
  project: IProjectData;
};

const ProjectLink = ({ project }: ProjectLinkProps) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const isMobileOrSmaller = useBreakpoint('phone');
  const projectTitleLocalized = localize(project.attributes.title_multiloc);
  const projectSlug = project.attributes.slug;

  return (
    <Box display="flex" my={isMobileOrSmaller ? '12px' : '24px'} gap="8px">
      <Box
        h="40px"
        w="40px"
        background={colors.grey200}
        borderRadius="90px"
        flexShrink={1}
      >
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
      <Box flexShrink={2}>
        <Text p="0px" m="0px" fontSize={isMobileOrSmaller ? 's' : 'base'}>
          {formatMessage(messages.eventFrom, {
            projectTitle: projectTitleLocalized,
          })}
        </Text>
        <Link to={`/projects/${projectSlug}`}>
          <Text
            fontSize={isMobileOrSmaller ? 'xs' : 's'}
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
