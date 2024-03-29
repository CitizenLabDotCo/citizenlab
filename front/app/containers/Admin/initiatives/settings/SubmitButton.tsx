import React from 'react';

import { fontSizes, colors, isRtl } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  ${isRtl`
    justify-content: flex-end;
  `}
`;

const ErrorMessage = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${colors.red600};
  font-weight: 400;
  line-height: normal;
  margin-left: 14px;
`;

const SuccessMessage = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${colors.success};
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
      id="e2e-initiative-settings-submit-button"
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
