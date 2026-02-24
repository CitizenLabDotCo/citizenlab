import React from 'react';

import { Toggle } from '@citizenlab/cl2-component-library';
import { useSearch } from 'utils/router';

import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import messages from '../messages';

const EmptyCustomFieldsFilter = () => {
  const [searchParams] = useSearch({ strict: false });

  const { formatMessage } = useIntl();
  return (
    <Toggle
      label={formatMessage(messages.filterOutEmptyCustomFields)}
      checked={
        searchParams.get('input_custom_field_no_empty_values') === 'true'
      }
      onChange={() => {
        if (searchParams.get('input_custom_field_no_empty_values') === 'true') {
          removeSearchParams(['input_custom_field_no_empty_values']);
        } else {
          updateSearchParams({ input_custom_field_no_empty_values: true });
        }
      }}
    />
  );
};

export default EmptyCustomFieldsFilter;
