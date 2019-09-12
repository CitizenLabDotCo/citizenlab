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

interface InputProps {
  onChange: (value: string[]) => void;
}

interface DataProps {
  locale: GetLocaleChildProps;
}

interface Props extends DataProps, InputProps { }

const ParticipationlevelFilter = memo<Props>(({ locale, onChange }) => {

  const graphQLLocale = !isNilOrError(locale) ? transformLocale(locale) : null;

  const PARTICIPATIONLEVELS_QUERY = gql`
    {
      participationLevels {
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

  const { data } = useQuery(PARTICIPATIONLEVELS_QUERY);

  const options = data ? data.participationLevels.nodes.map((node) => ({
    value: node.id,
    text: node.titleMultiloc[`${graphQLLocale}`]
  })) : [];

  const handleOnChange = useCallback((selectedValues: string[]) => {
    setSelectedValues(selectedValues);
    onChange(selectedValues);
  }, []);

  return (
    <FilterSelector
      title={'Participation levels'}
      name="participation levels"
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

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ParticipationlevelFilter {...dataProps} {...inputProps} />}
  </Data>
);
