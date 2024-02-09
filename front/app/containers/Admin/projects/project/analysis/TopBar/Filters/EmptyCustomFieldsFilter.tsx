import React from 'react';
import { Toggle } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

const EmptyCustomFieldsFilter = () => {
  const [searchParams] = useSearchParams();

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
