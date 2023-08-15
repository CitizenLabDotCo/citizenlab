import React from 'react';

// routing
import { useParams } from 'react-router-dom';

// api
import useProjectById from 'api/projects/useProjectById';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import GoBackButton from 'components/UI/GoBackButton';

// i18n
import useLocalize from 'hooks/useLocalize';

// styling
import { stylingConsts, colors } from 'utils/styleUtils';

const TopBar = () => {
  const localize = useLocalize();
  const { projectId } = useParams() as {
    projectId: string;
    analysisId: string;
  };
  const { data: project } = useProjectById(projectId);
  const projectTitle = project?.data.attributes.title_multiloc;

  return (
    <Box
      alignItems="center"
      w="100%"
      h={`${stylingConsts.menuHeight}px`}
      display="flex"
      background={`${colors.white}`}
      borderBottom={`1px solid ${colors.grey500}`}
      alignContent="center"
      gap="24px"
      px="24px"
    >
      <Box position="fixed">
        <GoBackButton linkTo={`/admin/projects/${projectId}/ideas`} />
      </Box>
      <Box w="100%" display="flex" justifyContent="center">
        <Box w="800px" px="20px">
          <Title variant="h4" m="0px">
            {localize(projectTitle)}
          </Title>
        </Box>
      </Box>
    </Box>
  );
};

export default TopBar;
