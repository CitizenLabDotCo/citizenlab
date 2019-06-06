import React, { memo, useCallback, useState, useEffect } from 'react';

// components
import SearchFilter from './SearchFilter';
import StatusFilter from './StatusFilter';
import TopicsFilter from './TopicsFilter';
// import AreaFilter from './AreaFilter';

// utils
import eventEmitter from 'utils/eventEmitter';

// style
import styled from 'styled-components';

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
  margin-bottom: 0px;
`;

export interface IIdeaFilters {
  search: string | null;
  idea_status: string | null;
  areas: string[] | null;
  topics: string[] | null;
}

interface Props {
  queryParameters: IQueryParameters;
  className?: string;
  onApply?: (arg: IIdeaFilters) => void;
  onChange?: (arg: IIdeaFilters) => void;
  onClose: () => void;
}

const FiltersSidebar = memo<Props>(({ queryParameters, className, onApply, onChange, onClose }) => {

  const [ideaFilters, setIdeaFilters] = useState<IIdeaFilters>({
    search: queryParameters.search || null,
    idea_status: queryParameters.idea_status || null,
    areas: queryParameters.areas || null,
    topics: queryParameters.topics || null
  });

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
        if (onApply) {
          onApply(ideaFilters);
        }
      })
    ];

    return () => subscriptions.forEach(subscription => subscription.unsubscribe());
  }, [ideaFilters, onApply]);

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

  // const handleAreasOnChange = useCallback((areas: string[] | null) => {
  //   setIdeaFilters(ideaFilters => ({
  //     ...ideaFilters,
  //     areas
  //   }));
  // }, []);

  const handleTopicsOnChange = useCallback((topics: string[] | null) => {
    setIdeaFilters(ideaFilters => ({
      ...ideaFilters,
      topics
    }));
  }, []);

  useEffect(() => {
    if (onChange) {
      onChange(ideaFilters);
    }
  }, [ideaFilters, onChange]);

  return (
    <Container className={className}>
      <StyledSearchFilter value={ideaFilters.search} onChange={handleSearchOnChange} />
      <StyledStatusFilter selectedStatusId={ideaFilters.idea_status} queryParameters={queryParameters} onChange={handleStatusOnChange} />
      <StyledTopicsFilter selectedTopicIds={ideaFilters.topics} onChange={handleTopicsOnChange} />
      {/* <AreaFilter selectedAreaIds={ideaFilters.areas} onChange={handleAreasOnChange}/> */}
    </Container>
  );
});

export default FiltersSidebar;
