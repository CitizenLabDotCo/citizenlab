import React, { memo, useCallback, useState } from 'react';

import {
  Button,
  Icon,
  Spinner,
  colors,
  fontSizes,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import useIdeaJsonFormSchema from 'api/idea_json_form_schema/useIdeaJsonFormSchema';
import useIdeaMarkers from 'api/idea_markers/useIdeaMarkers';
import { IdeaSortMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import { IdeaSortMethodFallback } from 'api/phases/utils';

import FiltersMapView from 'components/IdeaCards/IdeasWithFiltersSidebar/FiltersMapView';
import { Props as InputFiltersProps } from 'components/IdeaCards/IdeasWithFiltersSidebar/InputFilters';
import Centerer from 'components/UI/Centerer';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import { isNilOrError } from 'utils/helperUtils';

import IdeaMapCard from '../IdeaMapCard';
import messages from '../messages';

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

const IdeaMapCards = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-top: 20px;
  overflow-x: hidden;
  overflow-y: auto;
`;

const StyledIdeaMapCard = styled(IdeaMapCard)`
  margin-left: 20px;
  margin-right: 20px;
`;

const EmptyContainer = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 100px;
  margin-bottom: 100px;
`;

const IdeaIcon = styled(Icon)`
  flex: 0 0 26px;
  width: 26px;
  height: 26px;
  fill: ${colors.textSecondary};
`;

const EmptyMessage = styled.div`
  padding-left: 50px;
  padding-right: 50px;
  margin-top: 12px;
  margin-bottom: 30px;
`;

const EmptyMessageLine = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  text-align: center;
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
      selectedIdeaFilters,
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
            <Header>
              <Button
                buttonStyle="secondary-outlined"
                icon="filter"
                size="s"
                text={formatMessage(messages.filters)}
                onClick={() => {
                  setShowFilters(true);
                }}
              />
            </Header>
          )}

        {showFilters && hasInputFilterProps && (
          <>
            <FiltersMapView
              selectedIdeaFilters={selectedIdeaFilters || {}}
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
          <IdeaMapCards id="e2e-idea-map-cards">
            {ideaMarkers === undefined && (
              <Centerer>
                <Spinner />
              </Centerer>
            )}
            {ideaMarkers &&
              ideaMarkers.data.length > 0 &&
              ideaMarkers.data.map((ideaMarker) => (
                <StyledIdeaMapCard
                  projectId={projectId}
                  idea={ideaMarker}
                  key={ideaMarker.id}
                  phaseId={phaseId}
                  onSelectIdea={onSelectIdea}
                />
              ))}

            {!ideaMarkers ||
              (ideaMarkers.data.length === 0 && (
                <EmptyContainer>
                  <IdeaIcon ariaHidden name="idea" />
                  <EmptyMessage>
                    <EmptyMessageLine>
                      <FormattedMessage
                        {...(isFiltered
                          ? messages.noFilteredResults
                          : messages.noResults)}
                      />
                    </EmptyMessageLine>
                  </EmptyMessage>
                </EmptyContainer>
              ))}
          </IdeaMapCards>
        )}
      </Container>
    );
  }
);

export default MapIdeasList;
