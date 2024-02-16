import React, { useMemo } from 'react';

// api
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

// i18n
import useLocalize, { Localize } from 'hooks/useLocalize';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// components
import { Box, Select } from '@citizenlab/cl2-component-library';

// constants
import { SUPPORTED_INPUT_TYPES_ARRAY } from '../constants';

// typings
import { IOption } from 'typings';
import { IUserCustomFields } from 'api/user_custom_fields/types';

interface Props {
  userFieldId?: string;
  onChange: (userFieldId?: string) => void;
}

const generateOptions = (questions: IUserCustomFields, localize: Localize) => {
  const options = questions.data.map((question) => ({
    value: question.id,
    label: localize(question.attributes.title_multiloc),
  }));

  return [{ value: '', label: '' }, ...options];
};

const UserFieldSelect = ({ userFieldId, onChange }: Props) => {
  const { data: userFields } = useUserCustomFields({
    inputTypes: SUPPORTED_INPUT_TYPES_ARRAY,
  });
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const handleChange = ({ value }: IOption) => {
    onChange(value === '' ? undefined : value);
  };

  const userFieldOptions = useMemo(() => {
    return userFields ? generateOptions(userFields, localize) : [];
  }, [userFields, localize]);

  return (
    <Box width="100%" mb="20px">
      <Select
        label={formatMessage(messages.groupByUserField)}
        value={userFieldId}
        options={userFieldOptions}
        onChange={handleChange}
      />
    </Box>
  );
};

export default UserFieldSelect;
