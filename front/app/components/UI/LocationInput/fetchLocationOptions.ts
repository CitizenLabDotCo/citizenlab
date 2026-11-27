import { SupportedLocale } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { isValidCoordinate } from './utils';

type TextSearchResponse = {
  data: {
    type: string;
    attributes: {
      results: string[] | undefined;
    };
  };
};

const fetchLocationOptions = async (
  inputValue: string,
  locale: SupportedLocale
) => {
  try {
    const response = await fetcher<TextSearchResponse>({
      path: '/location/autocomplete',
      action: 'get',
      queryParams: {
        input: inputValue,
        language: locale,
      },
    });

    const options =
      response.data.attributes.results?.map((item) => ({
        label: item,
        value: item,
      })) || [];

    // Add the inputValue as an option if it is a valid coordinate
    if (isValidCoordinate(inputValue)) {
      options.push({ label: inputValue, value: inputValue });
    }

    return options;
  } catch (error) {
    return [];
  }
};

export default fetchLocationOptions;
