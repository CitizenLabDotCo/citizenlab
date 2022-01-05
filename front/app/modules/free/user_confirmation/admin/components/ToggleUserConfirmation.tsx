import React from 'react';
import { IAdminSettingsRegistrationSectionEndOutletProps } from 'utils/moduleUtils';
import {
  fontSizes,
  Toggle,
  Box,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import { colors } from 'utils/styleUtils';
import messages from './messages';
import styled from 'styled-components';
import { SubSectionTitle } from 'components/admin/Section';

const StyledToggle = styled(Toggle)`
  flex-direction: row-reverse;
  width: fit-content;

  & > div {
    font-weight: 600;
    padding-left: 0;
    padding-right: 1rem;
  }
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
`;

const ToggleUserConfirmation = ({
  onSettingChange,
  latestAppConfigSettings,
}: IAdminSettingsRegistrationSectionEndOutletProps) => {
  const isUserConfirmationEnabled =
    !!latestAppConfigSettings?.user_confirmation?.enabled;

  function handleToggleOnChange() {
    const newUserConfirmationSetting = {
      ...latestAppConfigSettings?.user_confirmation,
      enabled: !isUserConfirmationEnabled,
    };
    onSettingChange('user_confirmation')(newUserConfirmationSetting);
  }

  return (
    <Box mb="35px">
      <SubSectionTitle>
        <FormattedMessage {...messages.accountConfirmation} />
        <IconTooltip
          content={
            <FormattedMessage
              {...messages.whenTurnedOnUsersWillHaveToConfirm}
            />
          }
        />
      </SubSectionTitle>
      <ToggleLabel>
        <StyledToggle
          checked={isUserConfirmationEnabled}
          onChange={handleToggleOnChange}
          labelTextColor={colors.adminTextColor}
        />
        {isUserConfirmationEnabled ? (
          <FormattedMessage {...messages.enabled} />
        ) : (
          <FormattedMessage {...messages.disabled} />
        )}
      </ToggleLabel>
    </Box>
  );
};

export default ToggleUserConfirmation;
