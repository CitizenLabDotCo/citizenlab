import React from 'react';

import { Title } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import filterModalMessages from './ButtonWithFiltersModal/FiltersModal/messages';
import InputFilters, { InputFiltersProps } from './InputFilters';

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

interface Props extends InputFiltersProps {}

const ContentRight = (props: Props) => {
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
        defaultValue={props.ideaQueryParameters.search}
        phaseId={props.ideaQueryParameters.phase}
        {...props}
      />
    </Container>
  );
};

export default ContentRight;
