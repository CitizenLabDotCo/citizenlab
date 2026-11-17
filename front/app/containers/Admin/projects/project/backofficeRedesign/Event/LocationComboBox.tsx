import React, { ReactNode, useEffect, useMemo, useState } from 'react';

import { debounce } from 'lodash-es';

import useLocale from 'hooks/useLocale';

import fetchLocationOptions from 'components/UI/LocationInput/fetchLocationOptions';

import ComboBox from 'design-system/ComboBox';
import { ListBoxOption } from 'design-system/ListBox';
import 'design-system/tokens.css';

interface Props {
  label: ReactNode;
  placeholder: string;
  description?: ReactNode;
  errorMessage?: ReactNode;
  // The address; empty when there is none.
  value: string;
  onChange: (address: string) => void;
}

const LocationComboBox = ({
  label,
  placeholder,
  description,
  errorMessage,
  value,
  onChange,
}: Props) => {
  const locale = useLocale();
  const [results, setResults] = useState<string[]>([]);

  const search = useMemo(
    () =>
      debounce((text: string) => {
        fetchLocationOptions(text, locale).then((options) =>
          setResults(options.map((option) => option.value))
        );
      }, 500),
    [locale]
  );
  useEffect(() => () => search.cancel(), [search]);

  // The current address has to be in the list for it to show in the input.
  const addresses =
    value && !results.includes(value) ? [value, ...results] : results;
  const items = addresses.map((address) => ({ id: address }));

  return (
    <ComboBox
      label={label}
      placeholder={placeholder}
      description={description}
      errorMessage={errorMessage}
      isInvalid={!!errorMessage}
      items={items}
      value={value || null}
      onChange={(key) => {
        if (typeof key === 'string') onChange(key);
      }}
      onInputChange={(text) => {
        // Picking an address writes it into the input; that is not a search.
        if (text === value) return;
        if (text === '') {
          onChange('');
          return;
        }
        search(text);
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
