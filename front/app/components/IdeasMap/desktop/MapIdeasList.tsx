import React, { memo, useCallback, useState } from 'react';

import { Button, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import useIdeaJsonFormSchema from 'api/idea_json_form_schema/useIdeaJsonFormSchema';
import useIdeaMarkers from 'api/idea_markers/useIdeaMarkers';
import { IdeaSortMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import { IdeaSortMethodFallback } from 'api/phases/utils';

import { InputFiltersProps } from 'components/IdeaCards/IdeasWithFiltersSidebar/InputFilters';
import FiltersMapView from 'components/IdeaCards/IdeasWithFiltersSidebar/MapView/FiltersMapView';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

import IdeaMapCards from './IdeaMapCards';
import tracks from './tracks';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 20px;
  border-bottom: solid 1px #ccc;
`;

interface Props {
  projectId: string;
  phaseId?: string;
  className?: string;
  onSelectIdea: (ideaId: string | null) => void;
  inputFiltersProps?: InputFiltersProps;
}

const MapIdeasList = memo<Props>(
  ({ projectId, phaseId, className, onSelectIdea, inputFiltersProps }) => {
    const [searchParams] = useSearchParams();
    const isTabletOrSmaller = useBreakpoint('tablet');
    const { formatMessage } = useIntl();
    const [showFilters, setShowFilters] = useState(false);

    const {
      ideaQueryParameters,
      onChangeStatus,
      onChangeTopics,
      handleSortOnChange,
      onClearFilters,
      filtersActive,
      ideasFilterCounts,
      numberOfSearchResults,
    } = inputFiltersProps ?? {};

    const hasInputFilterProps =
      onChangeStatus && onChangeTopics && handleSortOnChange && onClearFilters;

    const { data: ideaCustomFieldsSchema } = useIdeaJsonFormSchema({
      projectId,
      phaseId,
    });
    const { data: phase } = usePhase(phaseId);

    const sort =
      (searchParams.get('sort') as IdeaSortMethod | null) ??
      phase?.data.attributes.ideas_order ??
      IdeaSortMethodFallback;
    const search = searchParams.get('search');
    const topicsParam = searchParams.get('topics');
    const topics: string[] = topicsParam ? JSON.parse(topicsParam) : [];

    const { data: ideaMarkers } = useIdeaMarkers({
      projectIds: [projectId],
      phaseId,
      sort,
      search,
      topics,
    });

    const handleSearchOnChange = useCallback((search: string | null) => {
      updateSearchParams({ search });
    }, []);

    const isFiltered = (search && search.length > 0) || topics.length > 0;

    if (isNilOrError(ideaCustomFieldsSchema)) return null;

    const methodConfig =
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      phase && getMethodConfig(phase.data.attributes?.participation_method);

    return (
      <Container className={className || ''}>
        {methodConfig?.showIdeaFilters &&
          !showFilters &&
          !isTabletOrSmaller && (
            // Show the "Filters" button only in the Desktop idea list view
            <Header>
              <Button
                buttonStyle="secondary-outlined"
                icon="filter"
                size="s"
                text={formatMessage(messages.filters)}
                onClick={() => {
                  trackEventByName(tracks.clickMapIdeaFiltersButton);
                  setShowFilters(true);
                }}
              />
            </Header>
          )}

        {showFilters && hasInputFilterProps && (
          <>
            <FiltersMapView
              ideaQueryParameters={ideaQueryParameters || {}}
              onClearFilters={onClearFilters}
              filtersActive={!!filtersActive}
              ideasFilterCounts={ideasFilterCounts}
              numberOfSearchResults={
                numberOfSearchResults ? numberOfSearchResults : 0
              }
              onSearch={handleSearchOnChange}
              onChangeStatus={onChangeStatus}
              onChangeTopics={onChangeTopics}
              handleSortOnChange={handleSortOnChange}
              opened={showFilters}
              onClose={() => {
                setShowFilters(false);
              }}
            />
          </>
        )}
        {!showFilters && (
          <IdeaMapCards
            ideaMarkers={ideaMarkers}
            projectId={projectId}
            phaseId={phaseId}
            isFiltered={isFiltered}
            onSelectIdea={onSelectIdea}
          />
        )}
      </Container>
    );
  }
);

export default MapIdeasList;
