import React from 'react';
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
import useFeatureFlag from 'hooks/useFeatureFlag';

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
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
`;

type Props = {
  isEnabled: boolean;
  onChange: (value: boolean) => void;
};

const ToggleUserConfirmation = ({ isEnabled, onChange }: Props) => {
  const emailConfirmPermissionEnabled = useFeatureFlag({
    name: 'permission_option_email_confirmation',
  });
  const showEmailConfirmationToggle = !emailConfirmPermissionEnabled;

  const handleChange = () => {
    onChange(!isEnabled);
  };

  if (!showEmailConfirmationToggle) {
    return null;
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
          checked={isEnabled}
          onChange={handleChange}
          labelTextColor={colors.primary}
        />
        {isEnabled ? (
          <FormattedMessage {...messages.enabled} />
        ) : (
          <FormattedMessage {...messages.disabled} />
        )}
      </ToggleLabel>
    </Box>
  );
};

export default ToggleUserConfirmation;
