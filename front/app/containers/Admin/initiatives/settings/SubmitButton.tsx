import React from 'react';

// styling
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// components
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ErrorMessage = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${colors.clRedError};
  font-weight: 400;
  line-height: normal;
  margin-left: 14px;
`;

const SuccessMessage = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${colors.clGreenSuccess};
  font-weight: 400;
  line-height: normal;
  margin-left: 14px;
`;

interface Props {
  disabled: boolean;
  processing: boolean;
  error: boolean;
  success: boolean;
  handleSubmit: () => void;
}

export default ({
  disabled,
  processing,
  error,
  success,
  handleSubmit,
}: Props) => (
  <ButtonContainer>
    <Button
      buttonStyle="admin-dark"
      onClick={handleSubmit}
      disabled={disabled}
      processing={processing}
    >
      {success ? (
        <FormattedMessage {...messages.initiativeSettingsFormSaved} />
      ) : (
        <FormattedMessage {...messages.initiativeSettingsFormSave} />
      )}
    </Button>

    {error && (
      <ErrorMessage>
        <FormattedMessage {...messages.initiativeSettingsFormError} />
      </ErrorMessage>
    )}

    {success && (
      <SuccessMessage>
        <FormattedMessage {...messages.initiativeSettingsFormSuccess} />
      </SuccessMessage>
    )}
  </ButtonContainer>
);
