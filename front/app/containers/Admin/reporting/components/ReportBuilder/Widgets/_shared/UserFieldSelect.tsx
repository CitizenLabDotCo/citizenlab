import React, { useMemo } from 'react';

import { Box, Select } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import {
  IUserCustomFieldData,
  IUserCustomFieldInputType,
  IUserCustomFields,
} from 'api/user_custom_fields/types';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import useLocalize, { Localize } from 'hooks/useLocalize';

interface Props {
  userFieldId?: string;
  inputTypes: IUserCustomFieldInputType[];
  label: string;
  onChange: (userFieldId?: string, fieldData?: IUserCustomFieldData) => void;
}

const generateOptions = (questions: IUserCustomFields, localize: Localize) => {
  const options = questions.data.map((question) => ({
    value: question.id,
    label: localize(question.attributes.title_multiloc),
  }));

  return [{ value: '', label: '' }, ...options];
};

const UserFieldSelect = ({
  userFieldId,
  inputTypes,
  label,
  onChange,
}: Props) => {
  const { data: userFields } = useUserCustomFields({
    inputTypes,
  });
  const localize = useLocalize();

  const handleChange = ({ value }: IOption) => {
    onChange(
      value === '' ? undefined : value,
      userFields?.data.find((field) => field.id === value)
    );
  };

  const userFieldOptions = useMemo(() => {
    return userFields ? generateOptions(userFields, localize) : [];
  }, [userFields, localize]);

  return (
    <Box width="100%" mb="20px">
      <Select
        id="e2e-user-field-select"
        label={label}
        value={userFieldId}
        options={userFieldOptions}
        onChange={handleChange}
      />
    </Box>
  );
};

export default UserFieldSelect;
