import React, { memo, FormEvent } from 'react';

import { Box, colors, fontSizes } from '@citizenlab/cl2-component-library';

import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';

import Button from 'components/UI/Button';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import { Props as InputFiltersProps } from '../InputFilters';
import messages from '../messages';

interface Props {
  onClick: (event: FormEvent) => void;
  selectedIdeaFilters: InputFiltersProps['selectedIdeaFilters'];
  onReset: (event: React.MouseEvent) => void;
  filtersActive: boolean;
}

const BottomBar = memo<Props>(
  ({ onClick, selectedIdeaFilters, onReset, filtersActive }) => {
    const { data: ideasFilterCounts } =
      useIdeasFilterCounts(selectedIdeaFilters);

    if (!ideasFilterCounts) return null;

    const buttonDisabled = !filtersActive;

    return (
      <Box
        background={colors.white}
        p="16px"
        pb="0"
        flex="1"
        borderTop={`1px solid ${colors.grey300}`}
      >
        <Button onClick={onClick} fullWidth={true}>
          <FormattedMessage
            {...messages.showXResults}
            values={{
              ideasCount: ideasFilterCounts.data.attributes.total,
            }}
          />
        </Button>
        <Button
          onClick={onReset}
          buttonStyle="text"
          fontSize={`${fontSizes.s}px`}
          disabled={buttonDisabled}
        >
          <FormattedMessage {...messages.resetFilters} />
          {buttonDisabled && (
            <ScreenReaderOnly>
              <FormattedMessage
                {...messages.a11y_disabledResetFiltersDescription}
              />
            </ScreenReaderOnly>
          )}
        </Button>
      </Box>
    );
  }
);

export default BottomBar;
