import React from 'react';

// hooks
import useUserCustomFieldOptions from 'modules/commercial/user_custom_fields/hooks/useUserCustomFieldOptions';

// components
import { Box, Input, Text } from '@citizenlab/cl2-component-library';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  fieldId: string;
}

const OptionInputs = ({ fieldId }: Props) => {
  const userCustomFieldOptions = useUserCustomFieldOptions(fieldId);
  if (isNilOrError(userCustomFieldOptions)) return null;

  return (
    <>
      {userCustomFieldOptions.map((field) => (
        <Box display="flex" alignItems="center">
          <Input type="number" />
          <Text ml="16px" mr="24px">
            50%
          </Text>
        </Box>
      ))}
    </>
  );
};

export default OptionInputs;
