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
import { useParams, useSearchParams } from 'react-router-dom';
import useLocalize from 'hooks/useLocalize';
import SearchInput from 'components/UI/SearchInput';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import Filters from './Filters';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';
import useAnalysis from 'api/analyses/useAnalysis';
import Tasks from '../Tasks';
import LaunchModal from '../LaunchModal';
import Modal from 'components/UI/Modal';
import FilterItems from '../FilterItems';
import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';

const TopBar = () => {
  const [urlParams] = useSearchParams();
  const phaseId = urlParams.get('phase_id') || undefined;

  const showLaunchModal = urlParams.get('showLaunchModal') === 'true';

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const { projectId, analysisId } = useParams() as {
    projectId: string;
    analysisId: string;
  };
  const { data: project } = useProjectById(projectId);
  const { data: analysis } = useAnalysis(analysisId);

  const filters = useAnalysisFilterParams();
  const projectTitle = project?.data.attributes.title_multiloc;
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const goBack = () => {
    if (analysis?.data.attributes.participation_method === 'native_survey') {
      clHistory.push(
        `/admin/projects/${projectId}/native-survey/results${
          phaseId ? `?phase_id=${phaseId}` : ''
        }`
      );
    } else {
      clHistory.push(`/admin/projects/${projectId}/ideas`);
    }
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
      <FilterItems filters={filters} isEditable />
      <Box marginLeft="auto">
        <SearchInput
          key={urlParams.get('search')}
          onChange={handleSearch}
          // TODO: add a11y number of search results
          defaultValue={urlParams.get('search') || ''}
          a11y_numberOfSearchResults={0}
        />
      </Box>
      <Tasks />
      <Box visibility={isFiltersOpen ? 'visible' : 'hidden'}>
        <Filters onClose={() => setIsFiltersOpen(false)} />
      </Box>
      <Modal
        opened={showLaunchModal}
        close={() => updateSearchParams({ showLaunchModal: false })}
      >
        <LaunchModal
          onClose={() => updateSearchParams({ showLaunchModal: false })}
        />
      </Modal>
    </Box>
  );
};

export default TopBar;
