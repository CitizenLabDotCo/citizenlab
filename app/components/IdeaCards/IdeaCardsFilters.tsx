import React, { memo, useCallback } from 'react';

// components
import SearchFilter from './SearchFilter';
import StatusFilter from './StatusFilter';
import TopicsFilter from './TopicsFilter';
import AreaFilter from './AreaFilter';

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

interface Props {
  queryParameters: IQueryParameters;
  className?: string;
  onSearchChange: (arg: string) => void;
  onStatusChange: (arg: string | null) => void;
  onAreasChange: (arg: string[]) => void;
  onTopicsChange: (arg: string[]) => void;
}

const IdeaCardsFilters = memo<Props>(({ queryParameters, className, onSearchChange, onStatusChange, onAreasChange, onTopicsChange }) => {

  const handleSearchOnChange = useCallback((search: string) => {
    onSearchChange(search);
  }, []);

  const handleStatusOnChange = useCallback((status: string | null) => {
    onStatusChange(status);
  }, []);

  const handleAreasOnChange = useCallback((areas: string[]) => {
    onAreasChange(areas);
  }, []);

  const handleTopicsOnChange = useCallback((topics: string[]) => {
    onTopicsChange(topics);
  }, []);

  return (
    <Container className={className}>
      <StyledSearchFilter onChange={handleSearchOnChange} />
      <StyledStatusFilter queryParameters={queryParameters} onChange={handleStatusOnChange} />
      <StyledTopicsFilter onChange={handleTopicsOnChange} />
      <StyledAreaFilter onChange={handleAreasOnChange}/>
    </Container>
  );
});

export default IdeaCardsFilters;
