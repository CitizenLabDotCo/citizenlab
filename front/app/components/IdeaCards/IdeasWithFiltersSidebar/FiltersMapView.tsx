import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { isNumber } from 'lodash-es';
import styled from 'styled-components';

import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';

import BottomBar from 'components/FiltersModal/BottomBar';
import TopBar from 'components/FiltersModal/TopBar';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

import InputFilters, { Props as InputFiltersProps } from './InputFilters';

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

interface Props extends InputFiltersProps {
  opened: boolean;
  onClose: () => void;
}

const FiltersMapView = ({
  selectedIdeaFilters,
  onClearFilters,
  onClose,
  ...filtersProps
}: Props) => {
  const { data: ideasFilterCounts } = useIdeasFilterCounts(selectedIdeaFilters);
  const total = isNilOrError(ideasFilterCounts)
    ? null
    : ideasFilterCounts.data.attributes.total;

  return (
    <>
      <Header>
        <TopBar onReset={onClearFilters} onClose={onClose} />
      </Header>
      <Box height="100%" overflowY="auto" bgColor={colors.grey100}>
        <Box p="16px">
          <InputFilters
            selectedIdeaFilters={selectedIdeaFilters}
            onClearFilters={onClearFilters}
            showClearButton={false}
            hideStatusFilter={true}
            {...filtersProps}
          />
        </Box>
      </Box>
      <Footer>
        <BottomBar
          buttonText={
            total && isNumber(total) ? (
              <FormattedMessage
                {...messages.showXResults}
                values={{
                  ideasCount: total,
                }}
              />
            ) : (
              <FormattedMessage {...messages.showResults} />
            )
          }
          onClick={onClose}
        />
      </Footer>
    </>
  );
};

export default FiltersMapView;
