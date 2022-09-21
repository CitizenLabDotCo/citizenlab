import React, { memo, useCallback, useState } from 'react';

// hooks
import useLocalize from 'hooks/useLocalize';
import useGraphqlTenantLocales from 'hooks/useGraphqlTenantLocales';

// graphql
import { gql, useQuery } from '@apollo/client';
import { client } from '../../utils/apolloUtils';

// components
import FilterSelector, {
  IFilterSelectorValue,
} from 'components/FilterSelector';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

interface Props {
  onChange: (value: string[]) => void;
}

const PurposeFilter = memo<Props & InjectedIntlProps>(
  ({ intl: { formatMessage }, onChange }) => {
    const localize = useLocalize();
    const graphqlTenantLocales = useGraphqlTenantLocales();

    const PURPOSES_QUERY = gql`
    {
      purposes {
        nodes {
          id
          titleMultiloc {
            ${graphqlTenantLocales}
          }
        }
      }
    }
  `;

    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    const { data } = useQuery(PURPOSES_QUERY, { client });

    let options: IFilterSelectorValue[] = [];

    if (data) {
      options = data.purposes.nodes.map((node) => ({
        value: node.id,
        text: localize(node.titleMultiloc),
      }));
    }

    const handleOnChange = useCallback((selectedValues: string[]) => {
      setSelectedValues(selectedValues);
      onChange(selectedValues);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <FilterSelector
        title={formatMessage(messages.purposes)}
        name={formatMessage(messages.purposes)}
        selected={selectedValues}
        values={options}
        onChange={handleOnChange}
        multipleSelectionAllowed={true}
        last={false}
        left="-5px"
        mobileLeft="-5px"
      />
    );
  }
);

export default injectIntl(PurposeFilter);
