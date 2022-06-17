import React from 'react';

// hooks
import useUserCustomFieldOptions from 'modules/commercial/user_custom_fields/hooks/useUserCustomFieldOptions';
import useLocalize from 'hooks/useLocalize';

// components
import { Box, Text, Toggle } from '@citizenlab/cl2-component-library';
import OptionInput from './OptionInput';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  userCustomFieldId: string;
}

const Options = ({ userCustomFieldId }: Props) => {
  const userCustomFieldOptions = useUserCustomFieldOptions(userCustomFieldId);
  const localize = useLocalize();

  if (isNilOrError(userCustomFieldOptions)) {
    return null;
  }

  const noop = () => {};

  return (
    <Box>
      {userCustomFieldOptions.map(({ id, attributes }) => (
        <Box key={id} display="flex">
          <Box display="flex" alignItems="center" width="50%">
            <Toggle checked onChange={noop} />

            <Text ml="12px" variant="bodyM" color="adminTextColor">
              {localize(attributes.title_multiloc)}
            </Text>
          </Box>

          <Box display="flex" alignItems="center" width="50%">
            <OptionInput onChange={noop} />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default Options;
