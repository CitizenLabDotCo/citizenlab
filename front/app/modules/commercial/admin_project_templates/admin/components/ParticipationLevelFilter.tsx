import React, { memo, useCallback, useState } from 'react';

import { gql, useQuery } from '@apollo/client';
import { WrappedComponentProps } from 'react-intl';

import FilterSelector, {
  IFilterSelectorValue,
} from 'components/FilterSelector';

import { injectIntl } from 'utils/cl-intl';

import useGraphqlTenantLocales from 'hooks/useGraphqlTenantLocales';
import useLocalize from 'hooks/useLocalize';

import { client } from '../../utils/apolloUtils';

import messages from './messages';

interface Props {
  onChange: (value: string[]) => void;
}

const ParticipationlevelFilter = memo<Props & WrappedComponentProps>(
  ({ intl: { formatMessage }, onChange }) => {
    const localize = useLocalize();
    const graphqlTenantLocales = useGraphqlTenantLocales();

    const PARTICIPATIONLEVELS_QUERY = gql`
    {
      participationLevels {
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

    const { data } = useQuery(PARTICIPATIONLEVELS_QUERY, { client });

    let options: IFilterSelectorValue[] = [];

    if (data) {
      options = data.participationLevels.nodes.map((node) => ({
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
        title={formatMessage(messages.participationLevels)}
        name={formatMessage(messages.participationLevels)}
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

export default injectIntl(ParticipationlevelFilter);
