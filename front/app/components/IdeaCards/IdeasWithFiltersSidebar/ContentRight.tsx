import React from 'react';

import { Title } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IdeaQueryParameters } from 'api/ideas/types';
import { IIdeasFilterCounts } from 'api/ideas_filter_counts/types';
import { IdeaSortMethod } from 'api/phases/types';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import filterModalMessages from './ButtonWithFiltersModal/FiltersModal/messages';
import InputFilters from './InputFilters';

import { gapWidth } from '.';

const Container = styled.div<{
  top: number;
  maxHeightOffset: number;
  gapWidth: number;
}>`
  flex: 0 0 352px;
  width: 352px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-self: flex-start;
  margin-left: ${({ gapWidth }) => gapWidth}px;
  max-height: calc(100vh - ${({ maxHeightOffset }) => maxHeightOffset}px);
  position: sticky;
  top: ${({ top }) => top}px;
  overflow-y: auto;
  padding-left: 8px;
  padding-right: 8px;
`;

interface Props {
  ideaQueryParameters: IdeaQueryParameters;
  filtersActive: boolean;
  ideasFilterCounts: IIdeasFilterCounts | undefined;
  numberOfSearchResults: number;
  onClearFilters: () => void;
  onSearch: (search: string) => void;
  onChangeStatus: (status: string | null) => void;
  onChangeTopics: (topics: string[] | null) => void;
  onChangeSort: (sort: IdeaSortMethod) => void;
}

const ContentRight = ({
  ideaQueryParameters,
  filtersActive,
  ideasFilterCounts,
  numberOfSearchResults,
  onClearFilters,
  onSearch,
  onChangeStatus,
  onChangeTopics,
  onChangeSort,
}: Props) => {
  /* 
    Likely not the most reliable way to determine if the bar is present.
    Context would probably be better, but this is a quick fix.
  */
  const projectCTABarTop = document.getElementById('project-cta-bar-top');

  return (
    <Container
      id="e2e-ideas-filters"
      top={projectCTABarTop ? 160 : 100}
      maxHeightOffset={projectCTABarTop ? 180 : 120}
      gapWidth={gapWidth}
    >
      {/*
      We have this Filters heading in the filters modal on mobile. 
      This title streamlines the experience on desktop (for screen reader users).
    */}
      <ScreenReaderOnly>
        <Title as="h2">
          <FormattedMessage {...filterModalMessages.filters} />
        </Title>
      </ScreenReaderOnly>
      <InputFilters
        defaultValue={ideaQueryParameters.search}
        selectedIdeaFilters={ideaQueryParameters}
        filtersActive={filtersActive}
        ideasFilterCounts={ideasFilterCounts}
        numberOfSearchResults={numberOfSearchResults}
        onClearFilters={onClearFilters}
        onSearch={onSearch}
        onChangeStatus={onChangeStatus}
        onChangeTopics={onChangeTopics}
        handleSortOnChange={onChangeSort}
        phaseId={ideaQueryParameters.phase}
      />
    </Container>
  );
};

export default ContentRight;
