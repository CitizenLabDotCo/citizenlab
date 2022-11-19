import React, { memo, useState, useEffect } from 'react';

// components
import { Icon, Spinner } from '@citizenlab/cl2-component-library';
import TopicFilterDropdown from 'components/IdeaCards/TopicFilterDropdown';
import SelectSort from 'components/IdeaCards/SortFilterDropdown';
import SearchInput from 'components/UI/SearchInput';
import IdeaMapCard from '../IdeaMapCard';

// hooks
import useLocale from 'hooks/useLocale';
import useIdeaMarkers from 'hooks/useIdeaMarkers';
import useProject from 'hooks/useProject';
import useIdeaCustomFieldsSchemas from 'hooks/useIdeaCustomFieldsSchemas';

// events
import {
  setIdeasSearch,
  setIdeasSort,
  setIdeasTopics,
  ideasSort$,
  ideasSearch$,
  ideasTopics$,
} from '../events';

// services
import { ideaDefaultSortMethodFallback } from 'services/participationContexts';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// typings
import { Sort } from 'resources/GetIdeas';

// utils
import { isFieldEnabled } from 'utils/projectUtils';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Loading = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 20px;
  border-bottom: solid 1px #ccc;
`;

const DropdownFilters = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const StyledSearchInput = styled(SearchInput)`
  width: 100%;
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
}

const MapIdeasList = memo<Props>(({ projectId, phaseId, className }) => {
  const locale = useLocale();
  const ideaCustomFieldsSchemas = useIdeaCustomFieldsSchemas({
    projectId,
    phaseId,
  });
  const project = useProject({ projectId });

  // ideaMarkers
  const [search, setSearch] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>(
    project?.attributes.ideas_order || ideaDefaultSortMethodFallback
  );
  const ideaMarkers = useIdeaMarkers({
    projectIds: [projectId],
    phaseId,
    sort,
    search,
    topics,
  });

  const isFiltered = (search && search.length > 0) || topics.length > 0;

  const topicsEnabled = isFieldEnabled(
    'topic_ids',
    ideaCustomFieldsSchemas,
    locale
  );

  useEffect(() => {
    const subscriptions = [
      ideasSearch$.subscribe((search) => {
        setSearch(search);
      }),
      ideasSort$.subscribe((sort) => {
        setSort(sort);
      }),
      ideasTopics$.subscribe((topics) => {
        setTopics(topics);
      }),
    ];

    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, []);

  const handleSearchOnChange = (newSearchValue: string) => {
    setIdeasSearch(newSearchValue || null);
  };

  const handleSortOnChange = (newSort: Sort) => {
    setIdeasSort(newSort);
  };

  const handleTopicsOnChange = (newTopics: string[]) => {
    setIdeasTopics(newTopics);
  };

  return (
    <Container className={className || ''}>
      <Header>
        <DropdownFilters>
          <SelectSort
            onChange={handleSortOnChange}
            alignment="left"
            defaultSortingMethod={
              project?.attributes.ideas_order || ideaDefaultSortMethodFallback
            }
          />
          {topicsEnabled && (
            <TopicFilterDropdown
              onChange={handleTopicsOnChange}
              alignment="left"
              projectId={projectId}
            />
          )}
        </DropdownFilters>

        <StyledSearchInput
          onChange={handleSearchOnChange}
          a11y_numberOfSearchResults={
            ideaMarkers && ideaMarkers.length > 0 ? ideaMarkers.length : 0
          }
        />
      </Header>

      <IdeaMapCards>
        {ideaMarkers === undefined && (
          <Loading>
            <Spinner />
          </Loading>
        )}

        {ideaMarkers &&
          ideaMarkers.length > 0 &&
          ideaMarkers.map((ideaMarker) => (
            <StyledIdeaMapCard
              projectId={projectId}
              ideaMarker={ideaMarker}
              key={ideaMarker.id}
              phaseId={phaseId}
            />
          ))}

        {(ideaMarkers === null || ideaMarkers?.length === 0) && (
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
        )}
      </IdeaMapCards>
    </Container>
  );
});

export default MapIdeasList;
