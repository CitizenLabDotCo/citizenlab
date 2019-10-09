import React, { memo, useCallback, useState } from 'react';
import { adopt } from 'react-adopt';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// graphql
import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

// utils
import { isNilOrError, transformLocale } from 'utils/helperUtils';

// components
import FilterSelector from 'components/FilterSelector';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

interface InputProps {
  onChange: (value: string[]) => void;
}

interface DataProps {
  locale: GetLocaleChildProps;
}

interface Props extends DataProps, InputProps { }

const PurposeFilter = memo<Props & InjectedIntlProps>(({ locale, intl: { formatMessage }, onChange }) => {

  const graphQLLocale = !isNilOrError(locale) ? transformLocale(locale) : null;

  const PURPOSES_QUERY = gql`
    {
      purposes {
        nodes {
          id
          titleMultiloc {
            ${graphQLLocale}
          }
        }
      }
    }
  `;

  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const { data } = useQuery(PURPOSES_QUERY);

  const options = data ? data.purposes.nodes.map((node) => ({
    value: node.id,
    text: node.titleMultiloc[`${graphQLLocale}`]
  })) : [];

  const handleOnChange = useCallback((selectedValues: string[]) => {
    setSelectedValues(selectedValues);
    onChange(selectedValues);
  }, []);

  return (
    <FilterSelector
      title={formatMessage(messages.purposes)}
      name={formatMessage(messages.purposes)}
      selected={selectedValues}
      values={options}
      onChange={handleOnChange}
      multiple={true}
      last={false}
      left="-5px"
      mobileLeft="-5px"
    />
  );
});

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />
});

const PurposeFilterWithHoC = injectIntl(PurposeFilter);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <PurposeFilterWithHoC {...dataProps} {...inputProps} />}
  </Data>
);
