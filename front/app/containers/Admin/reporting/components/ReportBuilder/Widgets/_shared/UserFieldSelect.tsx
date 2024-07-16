import React, { useMemo } from 'react';

import { Box, Select } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import { IUserCustomFieldData } from 'api/user_custom_fields/types';

import useLocalize, { Localize } from 'hooks/useLocalize';

interface Props {
  userFieldId?: string;
  userFields?: IUserCustomFieldData[];
  label: string;
  emptyOption?: boolean;
  onChange: (userFieldId?: string, fieldData?: IUserCustomFieldData) => void;
}

const generateOptions = (
  userFields: IUserCustomFieldData[],
  localize: Localize,
  emptyOption: boolean
) => {
  const options = userFields.map((field) => ({
    value: field.id,
    label: localize(field.attributes.title_multiloc),
  }));

  if (!emptyOption) return options;
  return [{ value: '', label: '' }, ...options];
};

const UserFieldSelect = ({
  userFieldId,
  userFields,
  label,
  emptyOption = true,
  onChange,
}: Props) => {
  const localize = useLocalize();

  const handleChange = ({ value }: IOption) => {
    onChange(
      value === '' ? undefined : value,
      userFields?.find((field) => field.id === value)
    );
  };

  const userFieldOptions = useMemo(() => {
    return userFields ? generateOptions(userFields, localize, emptyOption) : [];
  }, [userFields, localize, emptyOption]);

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
