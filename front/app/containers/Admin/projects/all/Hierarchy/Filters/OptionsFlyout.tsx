import React, { useState } from 'react';

import { Box, CheckboxWithLabel } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import { Level } from '../level';
import FlyoutSearch from '../Menu/FlyoutSearch';
import NothingToChoose from '../Menu/NothingToChoose';
import useFocusFirst from '../Menu/useFocusFirst';
import messages from '../messages';

import { FACETS, ListFacetKey } from './facets';
import { isPicked, togglePicked } from './selection';
import useFacetOptions from './useFacetOptions';
import useFilters from './useFilters';

interface Props {
  facetKey: ListFacetKey;
  level: Level;
  takeFocus: boolean;
}

// The choices of one filter, as checkboxes that apply at once.
const OptionsFlyout = ({ facetKey, level, takeFocus }: Props) => {
  const { formatMessage } = useIntl();
  const [query, setQuery] = useState('');
  const { valuesOf, setValues } = useFilters(level);
  const facetOptions = useFacetOptions([facetKey], level);
  const options = facetOptions.options[facetKey];
  const selected = valuesOf(facetKey);

  const focusFirstField = useFocusFirst(takeFocus, 'input');

  const shown = options.filter((option) =>
    option.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <Box
      ref={focusFirstField}
      role="group"
      aria-label={formatMessage(FACETS[facetKey].label)}
    >
      <FlyoutSearch
        count={options.length}
        value={query}
        onChange={setQuery}
        placeholder={formatMessage(messages.filterOptions)}
        label={formatMessage(messages.filterOptionsLabel)}
      />
      {options.length === 0 && !facetOptions.isLoading && <NothingToChoose />}
      {shown.map((option) => (
        <Box key={option.values.join()} px="8px" py="6px">
          <CheckboxWithLabel
            checked={isPicked(option, selected)}
            onChange={() => setValues(facetKey, togglePicked(option, selected))}
            label={option.label}
            size="16px"
          />
        </Box>
      ))}
    </Box>
  );
};

export default OptionsFlyout;
