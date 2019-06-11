import React, { memo, useCallback, useEffect } from 'react';

// components
import SearchFilter from './SearchFilter';
import StatusFilter from './StatusFilter';
import TopicsFilter from './TopicsFilter';

// utils
import eventEmitter from 'utils/eventEmitter';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// typings
import { IQueryParameters } from 'resources/GetIdeas';

const Container = styled.div``;

const StyledSearchFilter = styled(SearchFilter)`
  margin-bottom: 20px;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const StyledStatusFilter = styled(StatusFilter)`
  margin-bottom: 20px;
`;

const StyledTopicsFilter = styled(TopicsFilter)`
  margin-bottom: 0px;
`;

interface Props {
  selectedIdeaFilters: Partial<IQueryParameters>;
  className?: string;
  onApply?: () => void;
  onChange: (arg: Partial<IQueryParameters>) => void;
  onClose?: () => void;
}

const FiltersSidebar = memo<Props>(({ selectedIdeaFilters, className, onApply, onChange, onClose }) => {

  useEffect(() => {
    const subscriptions = [
      eventEmitter.observeEvent('closeIdeaFilters').subscribe(() => {
        onClose && onClose();
      }),

      eventEmitter.observeEvent('clearIdeaFilters').subscribe(() => {
        onChange({
          search: null,
          idea_status: null,
          areas: null,
          topics: null
        });
      }),

      eventEmitter.observeEvent('applyIdeaFilters').subscribe(() => {
        onApply && onApply();
      })
    ];

    return () => subscriptions.forEach(subscription => subscription.unsubscribe());
  }, []);

  const handleSearchOnChange = useCallback((search: string | null) => {
    onChange({ search });
  }, []);

  const handleStatusOnChange = useCallback((idea_status: string | null) => {
    onChange({ idea_status });
  }, []);

  const handleTopicsOnChange = useCallback((topics: string[] | null) => {
    onChange({ topics });
  }, []);

  return (
    <Container className={className}>
      <StyledSearchFilter value={selectedIdeaFilters.search} onChange={handleSearchOnChange} />
      <StyledStatusFilter selectedStatusId={selectedIdeaFilters.idea_status} onChange={handleStatusOnChange} />
      <StyledTopicsFilter selectedTopicIds={selectedIdeaFilters.topics} onChange={handleTopicsOnChange} />
    </Container>
  );
});

export default FiltersSidebar;
