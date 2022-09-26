import {
  Box,
  fontSizes,
  IconTooltip,
  Toggle,
} from '@citizenlab/cl2-component-library';
import { SubSectionTitle } from 'components/admin/Section';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import {
  AppConfigurationFeature,
  TAppConfigurationSetting,
} from 'services/appConfiguration';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import messages from './messages';

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

type Props = {
  onSettingChange: (
    setting: TAppConfigurationSetting
  ) => (value: AppConfigurationFeature) => void;
  userConfirmationSetting: AppConfigurationFeature;
};

const ToggleUserConfirmation = ({
  onSettingChange,
  userConfirmationSetting,
}: Props) => {
  function handleToggleOnChange() {
    const newUserConfirmationSetting = {
      ...userConfirmationSetting,
      enabled: !userConfirmationSetting.enabled,
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
          checked={userConfirmationSetting.enabled}
          onChange={handleToggleOnChange}
          labelTextColor={colors.adminTextColor}
        />
        {userConfirmationSetting.enabled ? (
          <FormattedMessage {...messages.enabled} />
        ) : (
          <FormattedMessage {...messages.disabled} />
        )}
      </ToggleLabel>
    </Box>
  );
};

export default ToggleUserConfirmation;
