import React from 'react';

// api
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

// i18n
import useLocalize from 'hooks/useLocalize';
// import { useIntl } from 'utils/cl-intl';
// import messages from './messages';

// components
import { Box, Select } from '@citizenlab/cl2-component-library';

// constants
import { SUPPORTED_INPUT_TYPES } from '../constants';

// typings
import { IOption } from 'typings';

interface Props {
  userFieldId?: string;
  onFilter: (fieldOption: IOption) => void;
}

const FieldFilter = ({ userFieldId, onFilter }: Props) => {
  const { data: userFields } = useUserCustomFields({
    inputTypes: Array.from(SUPPORTED_INPUT_TYPES) as any,
  });
  const localize = useLocalize();
  // const { formatMessage } = useIntl();

  const userFieldOptions = userFields
    ? userFields.data.map((field) => ({
        value: field.id,
        label: localize(field.attributes.title_multiloc),
      }))
    : [];

  return (
    <Box width="100%" mb="20px">
      <Select
        label={'Slice by'}
        value={userFieldId}
        options={[{ value: '', label: '' }, ...userFieldOptions]}
        onChange={onFilter}
      />
    </Box>
  );
};

export default FieldFilter;
