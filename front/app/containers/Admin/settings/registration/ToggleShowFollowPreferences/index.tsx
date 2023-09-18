import React from 'react';
import { Toggle, Box, Text, Title } from '@citizenlab/cl2-component-library';
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
    <Box>
      <SubSectionTitle>
        <FormattedMessage {...messages.askFollowPreferences} />
      </SubSectionTitle>
      <Box as="label" display="flex" alignItems="center">
        <Box w="fit-content" display="flex" flexDirection="row-reverse">
          <Toggle
            checked={isEnabled}
            onChange={handleChange}
            labelTextColor={colors.primary}
          />
        </Box>

        <Box display="flex" flexDirection="column">
          <Title
            color="primary"
            fontSize="l"
            pl="1rem"
            my="0px"
            style={{ fontWeight: 500 }}
          >
            <Box w="100%" display="flex">
              <FormattedMessage {...messages.followPreferences} />
            </Box>
          </Title>
          <Text fontSize="s" color="textSecondary" pl="1rem" mt="4px">
            <FormattedMessage {...messages.followHelperText} />
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default ToggleShowFollowPreferences;
