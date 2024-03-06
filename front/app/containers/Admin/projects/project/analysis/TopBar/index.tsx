import React, { useCallback, useEffect, useState } from 'react';

import {
  Box,
  stylingConsts,
  colors,
  Title,
  Badge,
  Text,
} from '@citizenlab/cl2-component-library';
import { get, set } from 'js-cookie';
import { useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import useAnalysis from 'api/analyses/useAnalysis';
import useAuthUser from 'api/me/useAuthUser';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import Button from 'components/UI/Button';
import GoBackButton from 'components/UI/GoBackButton';
import Modal from 'components/UI/Modal';
import SearchInput from 'components/UI/SearchInput';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import ClickOutside from 'utils/containers/clickOutside';

import FilterItems from '../FilterItems';
import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';
import LaunchModal from '../LaunchModal';
import Tasks from '../Tasks';

import Filters from './Filters';
import messages from './messages';

const TruncatedTitle = styled(Title)`
  white-space: nowrap;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TopBar = () => {
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const { data: authUser } = useAuthUser();
  const [urlParams] = useSearchParams();
  const phaseId = urlParams.get('phase_id') || undefined;
  const { projectId, analysisId } = useParams() as {
    projectId: string;
    analysisId: string;
  };

  const cookieName =
    authUser &&
    `analysis_launch_modal_for_user_id_${authUser.data.id}_analysis_id_${analysisId}_shown`;

  useEffect(() => {
    if (cookieName) {
      const cookieValue = get(cookieName);
      if (cookieValue !== 'true') {
        setShowLaunchModal(true);
      }
    }
  }, [cookieName, analysisId]);

  const resetFilters = urlParams.get('reset_filters') === 'true';

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const { data: project } = useProjectById(projectId);
  const { data: analysis } = useAnalysis(analysisId);

  const filters = useAnalysisFilterParams();

  useEffect(() => {
    if (resetFilters) {
      removeSearchParams(['reset_filters']);
    }
  }, [resetFilters]);

  const projectTitle = project?.data.attributes.title_multiloc;
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const goBack = () => {
    if (analysis?.data.attributes.participation_method === 'native_survey') {
      clHistory.push(
        `/admin/projects/${projectId}/phases/${phaseId}/native-survey`
      );
    } else {
      clHistory.push(`/admin/projects/${projectId}/phases/${phaseId}/ideas`);
    }
  };

  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  const handleSearch = (search: string) => {
    updateSearchParams({ search });
  };

  const closeFilters = useCallback(() => {
    setIsFiltersOpen(false);
  }, []);

  const closeLaunchModal = () => {
    setShowLaunchModal(false);
    if (cookieName) {
      set(cookieName, 'true');
    }
  };

  return (
    <ClickOutside onClickOutside={closeFilters}>
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
        gap="20px"
        px="20px"
      >
        <GoBackButton onClick={goBack} />
        <Box>
          <Box display="flex" gap="8px" alignItems="center">
            <Text m="0px" color="textSecondary">
              {formatMessage(messages.AIAnalysis)}
            </Text>
            <Badge color={colors.textSecondary} className="inverse">
              BETA
            </Badge>
          </Box>

          <TruncatedTitle variant="h4" m="0px">
            {localize(projectTitle)}
          </TruncatedTitle>
        </Box>
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
            key={urlParams.get('reset_filters')}
            onChange={handleSearch}
            // TODO: add a11y number of search results
            defaultValue={urlParams.get('search') || ''}
            a11y_numberOfSearchResults={0}
          />
        </Box>
        <Tasks />
        <Button
          icon="info-solid"
          buttonStyle="text"
          openLinkInNewTab
          linkTo={formatMessage(messages.supportArticleLink)}
          iconColor={colors.grey800}
        />
        {isFiltersOpen && <Filters onClose={() => setIsFiltersOpen(false)} />}
        <Modal opened={showLaunchModal} close={closeLaunchModal}>
          <LaunchModal onClose={closeLaunchModal} />
        </Modal>
      </Box>
    </ClickOutside>
  );
};

export default TopBar;
