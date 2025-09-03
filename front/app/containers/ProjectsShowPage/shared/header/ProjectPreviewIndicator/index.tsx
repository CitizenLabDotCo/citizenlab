import React from 'react';

import { Box, BoxProps, Text } from '@citizenlab/cl2-component-library';
import { get } from 'js-cookie';

import useProjectById from 'api/projects/useProjectById';

import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  projectId: string;
} & BoxProps;

const ProjectPreviewIndicator = ({ projectId, ...rest }: Props) => {
  const { formatMessage } = useIntl();
  const { data: project } = useProjectById(projectId);
  const projectPreviewTokenCookie = get('preview_token');

  if (
    project?.data.attributes.publication_status === 'draft' &&
    project.data.attributes.preview_token === projectPreviewTokenCookie
  ) {
    return (
      <Box {...rest}>
        <Warning icon="flag">
          <Box display="flex" gap="4px">
            <Text fontWeight="bold" m="0px">
              {formatMessage(messages.previewProject)}
            </Text>
            <Text m="0px">
              {formatMessage(messages.previewProjectExplanation)}
            </Text>
          </Box>
        </Warning>
      </Box>
    );
  }

  return null;
};

export default ProjectPreviewIndicator;
