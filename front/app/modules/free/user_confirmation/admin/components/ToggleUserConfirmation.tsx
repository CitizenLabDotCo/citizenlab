import React from 'react';
import { IAdminSettingsRegistrationFormOutletProps } from 'utils/moduleUtils';
import { fontSizes, Toggle } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import { colors } from 'utils/styleUtils';
import messages from './messages';
import styled from 'styled-components';

const ToggleContainer = styled.div`
  margin-bottom: 4rem;
`;

const ToggleHint = styled.p`
  font-size: ${fontSizes.small}px;
  color: ${colors.adminTextColor};
  max-width: 500px;
`;

const StyledToggle = styled(Toggle)`
  flex-direction: row-reverse;
  width: fit-content;
  margin-bottom: 1rem;

  & > div {
    font-weight: 600;
    padding-left: 0;
    padding-right: 1rem;
  }
`;

const ToggleUserConfirmation = ({
  onChange,
  latestAppConfigSettings,
}: IAdminSettingsRegistrationFormOutletProps) => {
  const isUserConfirmationEnabled =
    !!latestAppConfigSettings?.user_confirmation?.enabled;

  function handleToggleUserConfirmation() {
    const newUserConfirmationSetting = {
      ...latestAppConfigSettings?.user_confirmation,
      enabled: !isUserConfirmationEnabled,
    };
    onChange('user_confirmation')(newUserConfirmationSetting);
  }

  return (
    <ToggleContainer>
      <StyledToggle
        checked={isUserConfirmationEnabled}
        onChange={handleToggleUserConfirmation}
        label={<FormattedMessage {...messages.accountConfirmation} />}
        labelTextColor={colors.adminTextColor}
      />
      <ToggleHint>
        <FormattedMessage {...messages.whenTurnedOnUsersWillHaveToConfirm} />
      </ToggleHint>
    </ToggleContainer>
  );
};

export default ToggleUserConfirmation;
