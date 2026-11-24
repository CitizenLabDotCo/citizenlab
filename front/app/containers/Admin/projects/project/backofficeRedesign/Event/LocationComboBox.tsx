import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import { debounce } from 'lodash-es';

import ComboBox from 'design-system/ComboBox';
import { ListBoxOption } from 'design-system/ListBox';

import useLocale from 'hooks/useLocale';

import fetchLocationOptions from 'components/UI/LocationInput/fetchLocationOptions';

import 'design-system/tokens.css';

interface Props {
  label: ReactNode;
  placeholder: string;
  labelTooltip?: string;
  errorMessage?: ReactNode;
  // The address; empty when there is none.
  value: string;
  onChange: (address: string) => void;
}

const LocationComboBox = ({
  label,
  placeholder,
  labelTooltip,
  errorMessage,
  value,
  onChange,
}: Props) => {
  const locale = useLocale();
  const [results, setResults] = useState<string[]>([]);
  const latestRequest = useRef(0);

  const search = useMemo(
    () =>
      debounce(async (text: string, request: number) => {
        const options = await fetchLocationOptions(text, locale);
        if (request === latestRequest.current) {
          setResults(options.map((option) => option.value));
        }
      }, 500),
    [locale]
  );
  useEffect(
    () => () => {
      latestRequest.current += 1;
      search.cancel();
    },
    [search]
  );

  // The current address has to be in the list for it to show in the input.
  const addresses =
    value && !results.includes(value) ? [value, ...results] : results;
  const items = addresses.map((address) => ({ id: address }));

  return (
    <ComboBox
      label={label}
      placeholder={placeholder}
      labelTooltip={labelTooltip}
      errorMessage={errorMessage}
      isInvalid={!!errorMessage}
      items={items}
      value={value || null}
      onChange={(key) => {
        if (typeof key === 'string') {
          latestRequest.current += 1;
          search.cancel();
          onChange(key);
        }
      }}
      onInputChange={(text) => {
        latestRequest.current += 1;
        search.cancel();

        if (text === '') {
          setResults([]);
          if (value) onChange('');
          return;
        }

        // Picking an address writes it into the input; that is not a search.
        if (text !== value) search(text, latestRequest.current);
      }}
      data-cy="e2e-event-location-input"
    >
      {(item: { id: string }) => (
        <ListBoxOption id={item.id}>{item.id}</ListBoxOption>
      )}
    </ComboBox>
  );
};

export default LocationComboBox;
