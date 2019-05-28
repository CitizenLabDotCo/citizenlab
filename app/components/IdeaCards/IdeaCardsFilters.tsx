import React, { memo, useCallback } from 'react';

// components
import SearchFilter from './SearchFilter';
import StatusFilter from './StatusFilter';
import TopicsFilter from './TopicsFilter';
import AreaFilter from './AreaFilter';
import SearchInput from 'components/UI/SearchInput';

// style
import styled, { withTheme } from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';

// typings
import { IQueryParameters } from 'resources/GetIdeas';

const Container = styled.div``;

interface Props {
  queryParameters: IQueryParameters;
  className?: string;
}

const IdeaCardsFilters = memo<Props>(({ queryParameters, className }) => {

  handleSearchOnChange = useCallback((search: string) => {
    // this.props.ideas.onChangeSearchTerm(search);
  }, []);

  handleStatusOnChange = useCallback((status: string | null) => {
    // this.props.ideas.onChangeIdeaStatus(status);
  }, []);

  handleAreasOnChange = useCallback((areas: string[]) => {
    // this.props.ideas.onChangeAreas(areas);
  }, []);

  handleTopicsOnChange = useCallback((topics: string[]) => {
    // this.props.ideas.onChangeTopics(topics);
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
