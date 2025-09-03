import React from 'react';

import {
  Toggle,
  Box,
  Text,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';

import { SubSectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  isEnabled: boolean;
  onChange: (value: boolean) => void;
};

const ToggleShowFollowPreferences = ({ isEnabled, onChange }: Props) => {
  const handleChange = () => {
    onChange(!isEnabled);
  };

  return (
    <Box className="intercom-settings-tab-registration-follow-preferences">
      <SubSectionTitle>
        <FormattedMessage {...messages.askFollowPreferences} />
      </SubSectionTitle>
      <Box as="label" display="flex" alignItems="center">
        <Box w="fit-content" display="flex" flexDirection="row-reverse">
          <Toggle
            checked={isEnabled}
            onChange={handleChange}
            labelTextColor={colors.primary}
            id="e2e-toggle-follow-onboarding"
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
