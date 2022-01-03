import React from 'react';

// components
import {
  StyledHeaderContainer,
  StyledHeaderTitle,
} from 'components/SignUpIn/styles';
import ReactResizeDetector from 'react-resize-detector/build/withPolyfill';
import { HeaderSubtitle } from 'components/UI/Modal';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  inModal?: boolean;
  onResize: (w: number, h: number) => void;
  activeStepNumber: number | null;
  totalStepsCount: number;
  error?: string;
  stepName: string;
}

const Header = ({
  inModal,
  onResize,
  activeStepNumber,
  totalStepsCount,
  error,
  stepName,
}: Props) => {
  return (
    <div>
      <ReactResizeDetector handleWidth handleHeight onResize={onResize}>
        <div>
          <StyledHeaderContainer inModal={!!inModal}>
            <StyledHeaderTitle inModal={!!inModal}>
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
        </div>
      </ReactResizeDetector>
    </div>
  );
};

export default Header;
