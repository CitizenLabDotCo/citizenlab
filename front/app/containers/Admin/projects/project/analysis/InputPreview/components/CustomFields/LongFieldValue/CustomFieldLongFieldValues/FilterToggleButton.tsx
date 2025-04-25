import React from 'react';

import { IconTooltip, Button, Box } from '@citizenlab/cl2-component-library';
import { xor } from 'lodash-es';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import useAnalysisFilterParams from '../../../../../hooks/useAnalysisFilterParams';
import messages from '../../../../../messages';
import tracks from '../../../../../tracks';

export const FilterToggleButton = ({ customFieldId, value }) => {
  const { formatMessage } = useIntl();
  const filters = useAnalysisFilterParams();
  const filterValue = filters[`input_custom_${customFieldId}`];
  const isFilterSet = Array.isArray(filterValue) && filterValue.includes(value);

  const handleToggleFilterOption = (customFieldId, customOptionKey) => () => {
    const currentFilterValue = Array.isArray(filterValue) ? filterValue : [];
    const newFilterValue = xor(currentFilterValue, [customOptionKey]);
    updateSearchParams({
      [`input_custom_${customFieldId}`]: newFilterValue.length
        ? newFilterValue
        : undefined,
    });
    trackEventByName(tracks.inputCustomFieldFilterUsed, { customFieldId });
  };

  return (
    <Button
      onClick={handleToggleFilterOption(customFieldId, value)}
      buttonStyle="secondary-outlined"
      size="s"
      margin="0"
      padding="1px"
    >
      <IconTooltip
        icon={isFilterSet ? 'close' : 'filter-2'}
        content={
          <Box minWidth="150px">
            {isFilterSet
              ? formatMessage(messages.removeFilter)
              : formatMessage(messages.filter)}
          </Box>
        }
      />
    </Button>
  );
};
