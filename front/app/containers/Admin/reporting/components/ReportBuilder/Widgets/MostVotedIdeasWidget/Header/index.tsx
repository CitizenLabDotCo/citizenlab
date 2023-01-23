import React from 'react';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import ProjectInfo from './ProjectInfo';

// i18n
import messages from '../messages';
import { useIntl } from 'utils/cl-intl';

interface Props {
  title?: string;
  projectId?: string;
  phaseId?: string;
}

const Header = ({ title, projectId, phaseId }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box>
      <Title variant="h3" color="primary" m="16px" mb="8px">
        {title || formatMessage(messages.mostVotedIdeas)}
      </Title>
      <ProjectInfo projectId={projectId} phaseId={phaseId} />
    </Box>
  );
};

export default Header;
