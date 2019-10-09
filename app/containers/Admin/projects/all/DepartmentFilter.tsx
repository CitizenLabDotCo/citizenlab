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

const DepartmentFilter = memo<Props & InjectedIntlProps>(({ locale, intl: { formatMessage }, onChange }) => {

  const graphQLLocale = !isNilOrError(locale) ? transformLocale(locale) : null;

  const DEPARTMENTS_QUERY = gql`
    {
      departments {
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

  const { data } = useQuery(DEPARTMENTS_QUERY);

  const options = data ? data.departments.nodes.map((node) => ({
    value: node.id,
    text: node.titleMultiloc[`${graphQLLocale}`]
  })) : [];

  const handleOnChange = useCallback((selectedValues: string[]) => {
    setSelectedValues(selectedValues);
    onChange(selectedValues);
  }, []);

  return (
    <FilterSelector
      title={formatMessage(messages.departments)}
      name={formatMessage(messages.departments)}
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

const DepartmentFilterWithHoC = injectIntl(DepartmentFilter);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <DepartmentFilterWithHoC {...dataProps} {...inputProps} />}
  </Data>
);
