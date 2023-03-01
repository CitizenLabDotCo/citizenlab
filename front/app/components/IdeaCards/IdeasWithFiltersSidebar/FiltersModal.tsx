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
  onReset: () => void;
  onClose: () => void;
}

const FiltersModal = ({
  opened,
  selectedIdeaFilters,
  onReset,
  onClose,
  ...filtersSideBarProps
}: Props) => {
  const ideasFilterCounts = useIdeasFilterCounts(selectedIdeaFilters);
  const results =
    !isNilOrError(ideasFilterCounts) && isNumber(ideasFilterCounts.total);

  return (
    <FullscreenModal
      opened={opened}
      close={onClose}
      animateInOut={true}
      topBar={<TopBar onReset={onReset} onClose={onClose} />}
      bottomBar={
        <BottomBar
          buttonText={
            results ? (
              <FormattedMessage
                {...messages.showXResults}
                values={{
                  ideasCount: ideasFilterCounts.total,
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
          {...filtersSideBarProps}
        />
      </Box>
    </FullscreenModal>
  );
};

export default FiltersModal;
