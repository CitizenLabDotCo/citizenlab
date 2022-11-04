import React from 'react';

// components
import { StyledHeaderContainer, StyledHeaderTitle } from '../styles';
import { HeaderSubtitle } from 'components/UI/Modal';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  inModal?: boolean;
  activeStepNumber: number | null;
  totalStepsCount: number;
  error?: string | null;
  stepName: string;
}

const Header = ({
  inModal,
  activeStepNumber,
  totalStepsCount,
  error,
  stepName,
}: Props) => {
  return (
    <StyledHeaderContainer inModal={!!inModal}>
      <StyledHeaderTitle>
        <FormattedMessage {...messages.signUp2} />
      </StyledHeaderTitle>

      {!error && stepName && (
        <HeaderSubtitle>
          {totalStepsCount > 1 && activeStepNumber ? (
            <FormattedMessage
              {...messages.headerSubtitle}
              values={{
                activeStepNumber,
                stepName,
                totalStepsCount,
              }}
            />
          ) : (
            stepName
          )}
        </HeaderSubtitle>
      )}
    </StyledHeaderContainer>
  );
};

export default Header;
