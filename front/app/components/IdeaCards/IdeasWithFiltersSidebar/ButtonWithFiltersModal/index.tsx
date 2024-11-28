import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { isNumber } from 'lodash-es';

import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';

import FullscreenModal from 'components/UI/FullscreenModal';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import InputFilters, { Props as InputFiltersProps } from '../InputFilters';

import BottomBar from './BottomBar';
import messages from './messages';
import TopBar from './TopBar';

interface Props extends InputFiltersProps {
  opened: boolean;
  onClose: () => void;
}

const ButtonWithFiltersModal = ({
  opened,
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
    <FullscreenModal
      opened={opened}
      close={onClose}
      topBar={<TopBar onReset={onClearFilters} onClose={onClose} />}
      bottomBar={
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
      }
      contentBgColor="background"
    >
      <Box p="16px">
        <InputFilters
          selectedIdeaFilters={selectedIdeaFilters}
          onClearFilters={onClearFilters}
          // We have a reset filters button in TopBar
          showResetButton={false}
          {...filtersProps}
        />
      </Box>
    </FullscreenModal>
  );
};

export default ButtonWithFiltersModal;
