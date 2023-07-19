import React from 'react';
import {
  Box,
  stylingConsts,
  colors,
  Title,
} from '@citizenlab/cl2-component-library';
import GoBackButton from 'components/UI/GoBackButton';
import clHistory from 'utils/cl-router/history';
import useProjectById from 'api/projects/useProjectById';
import { useParams } from 'react-router-dom';
import useLocalize from 'hooks/useLocalize';
import SearchInput from 'components/UI/SearchInput';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

const TopBar = () => {
  const { projectId } = useParams() as { projectId: string };
  const { data: project } = useProjectById(projectId);
  const projectTitle = project?.data.attributes.title_multiloc;
  const localize = useLocalize();

  return (
    <Box
      position="fixed"
      zIndex="3"
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
      <GoBackButton onClick={() => clHistory.back()} />
      <Title variant="h4" m="0px">
        {localize(projectTitle)}
      </Title>
      <Box marginLeft="auto">
        <SearchInput
          onChange={(search) => updateSearchParams({ search })}
          // TODO: add a11y number of search results
          a11y_numberOfSearchResults={0}
        />
      </Box>
    </Box>
  );
};

export default TopBar;
