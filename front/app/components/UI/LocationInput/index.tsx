import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import selectStyles from 'components/UI/MultipleSelect/styles';
import fetcher from 'utils/cl-react-query/fetcher';
import useLocale from 'hooks/useLocale';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

export interface Option {
  label: string;
  value: string;
}

type TextSearchResponse = {
  data: {
    type: string;
    attributes: {
      results: string[] | undefined;
    };
  };
};

const LocationInput = (
  props: React.ComponentProps<typeof AsyncSelect> & {
    value?: Option | null;
  }
) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const [defaultOptions, setDefaultOptions] = useState<Option[]>([]);

  useEffect(() => {
    const fetchDefaultOptions = async () => {
      try {
        const response = await fetcher<TextSearchResponse>({
          path: '/location/autocomplete',
          action: 'get',
          queryParams: {
            input: props.value?.value,
            language: locale,
          },
        });

        return setDefaultOptions(
          response.data.attributes.results?.map((item) => ({
            label: item,
            value: item,
          })) || []
        );
      } catch (error) {
        return setDefaultOptions([]);
      }
    };

    if (props.value?.value) {
      fetchDefaultOptions();
    }
  }, [locale, props.value?.value]);

  const promiseOptions = async (inputValue: string) => {
    try {
      const response = await fetcher<TextSearchResponse>({
        path: '/location/autocomplete',
        action: 'get',
        queryParams: {
          input: inputValue,
          language: locale,
        },
      });

      return (
        response.data.attributes.results?.map((item) => ({
          label: item,
          value: item,
        })) || []
      );
    } catch (error) {
      return [];
    }
  };

  return (
    <AsyncSelect
      defaultOptions={defaultOptions}
      loadOptions={promiseOptions}
      styles={selectStyles}
      noOptionsMessage={() => formatMessage(messages.noOptions)}
      blurInputOnSelect
      menuShouldScrollIntoView={false}
      isClearable
      openMenuOnClick={false}
      {...props}
    />
  );
};

export default LocationInput;
