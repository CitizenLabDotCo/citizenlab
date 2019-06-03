import React, { memo, useCallback, useState, useEffect } from 'react';

// components
import SearchFilter from './SearchFilter';
import StatusFilter from './StatusFilter';
import TopicsFilter from './TopicsFilter';
import AreaFilter from './AreaFilter';

// utils
import eventEmitter from 'utils/eventEmitter';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';

// typings
import { IQueryParameters } from 'resources/GetIdeas';

const Container = styled.div``;

const StyledSearchFilter = styled(SearchFilter)`
  margin-bottom: 20px;
`;

const StyledStatusFilter = styled(StatusFilter)`
  margin-bottom: 20px;
`;

const StyledTopicsFilter = styled(TopicsFilter)`
  margin-bottom: 20px;
`;

const StyledAreaFilter = styled(AreaFilter)``;

export interface IIdeaFilters {
  search: string | null;
  idea_status: string | null;
  areas: string[] | null;
  topics: string[] | null;
}

interface Props {
  queryParameters: IQueryParameters;
  className?: string;
  onApply: (arg: IIdeaFilters) => void;
  onClose: () => void;
}

const IdeaFilters = memo<Props>(({ queryParameters, className, onApply, onClose }) => {

  const [ideaFilters, setIdeaFilters] = useState<IIdeaFilters>({
    search: queryParameters.search || null,
    idea_status: queryParameters.idea_status || null,
    areas: queryParameters.areas || null,
    topics: queryParameters.topics || null
  });

  // useEffect(() => {
  //   setIdeaFilters({
  //     search: queryParameters.search || '',
  //     status: queryParameters.idea_status || null,
  //     areas: queryParameters.areas || [],
  //     topics: queryParameters.topics || []
  //   });
  // }, [queryParameters]);

  useEffect(() => {
    const subscriptions = [
      eventEmitter.observeEvent('closeIdeaFilters').subscribe(() => {
        onClose();
      }),

      eventEmitter.observeEvent('clearIdeaFilters').subscribe(() => {
        setIdeaFilters({
          search: null,
          idea_status: null,
          areas: null,
          topics: null
        });
      }),

      eventEmitter.observeEvent('applyIdeaFilters').subscribe(() => {
        onApply(ideaFilters);
      })
    ];

    return () => subscriptions.forEach(subscription => subscription.unsubscribe());
  }, [ideaFilters]);

  const handleSearchOnChange = useCallback((search: string | null) => {
    setIdeaFilters(ideaFilters => ({
      ...ideaFilters,
      search
    }));
  }, []);

  const handleStatusOnChange = useCallback((idea_status: string | null) => {
    setIdeaFilters(ideaFilters => ({
      ...ideaFilters,
      idea_status
    }));
  }, []);

  const handleAreasOnChange = useCallback((areas: string[] | null) => {
    setIdeaFilters(ideaFilters => ({
      ...ideaFilters,
      areas
    }));
  }, []);

  const handleTopicsOnChange = useCallback((topics: string[] | null) => {
    setIdeaFilters(ideaFilters => ({
      ...ideaFilters,
      topics
    }));
  }, []);

  return (
    <Container className={className}>
      <StyledSearchFilter value={ideaFilters.search || null} onChange={handleSearchOnChange} />
      <StyledStatusFilter selectedStatusId={ideaFilters.idea_status || null} queryParameters={queryParameters} onChange={handleStatusOnChange} />
      <StyledTopicsFilter selectedTopicIds={ideaFilters.topics || null} onChange={handleTopicsOnChange} />
      <StyledAreaFilter selectedAreaIds={ideaFilters.areas || null} onChange={handleAreasOnChange}/>
    </Container>
  );
});

export default IdeaFilters;
