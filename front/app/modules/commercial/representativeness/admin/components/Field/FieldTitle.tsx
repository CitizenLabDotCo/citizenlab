import React from 'react';
// hooks
import useLocalize from 'hooks/useLocalize';

// components
import { Box, Title, Text } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// typings
import { Multiloc } from 'typings';

interface Props {
  titleMultiloc: Multiloc;
  isDefault: boolean;
}

const FieldTitle = ({ titleMultiloc, isDefault }: Props) => {
  const localize = useLocalize();

  return (
    <Box
      py="20px"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
    >
      <Box display="flex" alignItems="center">
        <Title variant="h4" as="h3" mt="0px" mb="0px" ml="12px">
          {localize(titleMultiloc)}
        </Title>
      </Box>

      {isDefault && (
        <Text mt="0px" mb="0px" variant="bodyS" color="adminTextColor">
          <FormattedMessage {...messages.defaultField} />
        </Text>
      )}
    </Box>
  );
};

export default FieldTitle;
