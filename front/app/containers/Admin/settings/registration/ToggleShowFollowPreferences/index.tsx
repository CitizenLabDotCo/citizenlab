import React from 'react';
import {
  Toggle,
  Box,
  IconTooltip,
  Text,
} from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import { colors } from 'utils/styleUtils';
import messages from './messages';
import { SubSectionTitle } from 'components/admin/Section';

type Props = {
  isEnabled: boolean;
  onChange: (value: boolean) => void;
};

const ToggleShowFollowPreferences = ({ isEnabled, onChange }: Props) => {
  const handleChange = () => {
    onChange(!isEnabled);
  };

  return (
    <Box mb="35px">
      <SubSectionTitle>
        <FormattedMessage {...messages.requestFollowPreferences} />
        <IconTooltip content={<FormattedMessage {...messages.helperText} />} />
      </SubSectionTitle>
      <Box as="label" display="flex" alignItems="center">
        <Box w="fit-content" display="flex" flexDirection="row-reverse">
          <Toggle
            checked={isEnabled}
            onChange={handleChange}
            labelTextColor={colors.primary}
          />
        </Box>

        <Text fontSize="base" color="textSecondary" pl="1rem" my="0px">
          {isEnabled ? (
            <FormattedMessage {...messages.enabled} />
          ) : (
            <FormattedMessage {...messages.disabled} />
          )}
        </Text>
      </Box>
    </Box>
  );
};

export default ToggleShowFollowPreferences;
