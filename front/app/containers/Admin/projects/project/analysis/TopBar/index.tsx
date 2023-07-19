import React, { useState } from 'react';
import {
  Box,
  stylingConsts,
  colors,
  Title,
  Button,
} from '@citizenlab/cl2-component-library';
import GoBackButton from 'components/UI/GoBackButton';
import clHistory from 'utils/cl-router/history';
import useProjectById from 'api/projects/useProjectById';
import { useParams } from 'react-router-dom';
import useLocalize from 'hooks/useLocalize';
import SearchInput from 'components/UI/SearchInput';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import Filters from './Filters';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

const TopBar = () => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const { projectId } = useParams() as { projectId: string };
  const { data: project } = useProjectById(projectId);
  const projectTitle = project?.data.attributes.title_multiloc;
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const goBack = () => {
    clHistory.goBack();
  };

  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  const handleSearch = (search: string) => {
    updateSearchParams({ search });
  };

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
      <GoBackButton onClick={goBack} />
      <Title variant="h4" m="0px">
        {localize(projectTitle)}
      </Title>
      <Button
        buttonStyle="secondary"
        icon="filter"
        size="s"
        onClick={toggleFilters}
      >
        {formatMessage(messages.filters)}
      </Button>

      <Box marginLeft="auto">
        <SearchInput
          onChange={handleSearch}
          // TODO: add a11y number of search results
          a11y_numberOfSearchResults={0}
        />
      </Box>
      {isFiltersOpen && <Filters />}
    </Box>
  );
};

export default TopBar;
