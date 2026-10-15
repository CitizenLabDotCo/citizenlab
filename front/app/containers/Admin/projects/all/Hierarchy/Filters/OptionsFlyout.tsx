import React, { useRef, useState } from 'react';

import {
  Box,
  CheckboxWithLabel,
  Input,
  Text,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import { Level } from '../level';
import messages from '../messages';

import { FACETS, ListFacetKey } from './facets';
import { isPicked, togglePicked } from './selection';
import useFacetOptions from './useFacetOptions';
import useFilters from './useFilters';

// Past this many choices, a box to narrow them down.
const MAX_UNFILTERED_OPTIONS = 5;

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

  // The first field takes the focus once it's there: the choices can still be
  // loading when the flyout opens.
  const focused = useRef(false);
  const focusFirstField = (node: HTMLDivElement | null) => {
    const first = node?.querySelector('input');
    if (takeFocus && first && !focused.current) {
      focused.current = true;
      first.focus();
    }
  };

  const shown = options.filter((option) =>
    option.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <Box
      ref={focusFirstField}
      role="group"
      aria-label={formatMessage(FACETS[facetKey].label)}
    >
      {options.length > MAX_UNFILTERED_OPTIONS && (
        <Box mb="4px">
          <Input
            type="text"
            size="small"
            value={query}
            onChange={setQuery}
            placeholder={formatMessage(messages.filterOptions)}
            ariaLabel={formatMessage(messages.filterOptionsLabel)}
          />
        </Box>
      )}
      {options.length === 0 && !facetOptions.isLoading && (
        <Box px="8px" py="6px">
          <Text as="span" m="0" variant="boMicro" color="coolGrey500">
            {formatMessage(messages.nothingToChoose)}
          </Text>
        </Box>
      )}
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
