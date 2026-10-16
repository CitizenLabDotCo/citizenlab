import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import { Level } from '../level';
import CheckRow from '../Menu/CheckRow';
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

  const focusFirstField = useFocusFirst(takeFocus, 'input, button');

  const shown = options.filter((option) =>
    option.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <Box ref={focusFirstField}>
      <FlyoutSearch
        count={options.length}
        value={query}
        onChange={setQuery}
        placeholder={formatMessage(messages.filterOptions)}
        label={formatMessage(messages.filterOptionsLabel)}
      />
      {options.length === 0 && !facetOptions.isLoading && <NothingToChoose />}
      {/* The menu holds the choices alone, not the search box above them. */}
      {shown.length > 0 && (
        <Box role="menu" aria-label={formatMessage(FACETS[facetKey].label)}>
          {shown.map((option) => (
            <CheckRow
              key={option.values.join()}
              label={option.label}
              checked={isPicked(option, selected)}
              onToggle={() =>
                setValues(facetKey, togglePicked(option, selected))
              }
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default OptionsFlyout;
