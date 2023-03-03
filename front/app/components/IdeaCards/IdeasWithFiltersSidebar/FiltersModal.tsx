import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import TopBar from 'components/FiltersModal/TopBar';
import BottomBar from 'components/FiltersModal/BottomBar';
import FullscreenModal from 'components/UI/FullscreenModal';
import FiltersSideBar, { Props as FiltersSideBarProps } from './FiltersSideBar';
import useIdeasFilterCounts from 'hooks/useIdeasFilterCounts';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { isNumber } from 'lodash-es';

interface Props extends FiltersSideBarProps {
  opened: boolean;
  onClose: () => void;
}

const FiltersModal = ({
  opened,
  selectedIdeaFilters,
  onClearFilters,
  onClose,
  ...filtersSideBarProps
}: Props) => {
  const ideasFilterCounts = useIdeasFilterCounts(selectedIdeaFilters);
  const total = isNilOrError(ideasFilterCounts)
    ? null
    : ideasFilterCounts.data.attributes.total;

  return (
    <FullscreenModal
      opened={opened}
      close={onClose}
      animateInOut={true}
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
    >
      <Box background={colors.background} padding="15px">
        <FiltersSideBar
          selectedIdeaFilters={selectedIdeaFilters}
          onClearFilters={onClearFilters}
          {...filtersSideBarProps}
        />
      </Box>
    </FullscreenModal>
  );
};

export default FiltersModal;
