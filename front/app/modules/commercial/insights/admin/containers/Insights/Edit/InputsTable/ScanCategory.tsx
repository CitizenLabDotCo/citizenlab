import React from 'react';

// styles
import styled, { css, keyframes } from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// intl
import messages from '../../messages';
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps, MessageDescriptor } from 'react-intl';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import { ScanStatus } from 'modules/commercial/insights/api/category_suggestions/types';

const ScanContainer = styled.div`
  width: 100%;
  background-color: ${colors.teal100};
  padding: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${colors.primary};
  text-align: left;
  border-radius: 3px;
  position: relative;
  margin-bottom: 16px;

  .scanTitle {
    font-weight: bold;
    font-size: ${fontSizes.base}px;
    padding-bottom: 8px;
    margin: 0;
  }
  .scanDescription {
    font-size: ${fontSizes.s}px;
  }
`;

const ProgressBar = styled(Box)`
  ${({ isInProgress }: { isInProgress: boolean }) => css`
    transition: ${isInProgress ? 'width 1s ease-in-out' : 'none'};
    ${isInProgress
      ? css`
      animation: ${progress} 1s ease-in;
      animation-fill-mode: forwards;
 }`
      : css`
          min-width: 0%;
        `};
  `}
`;

const progress = keyframes`
  from {
    min-width: 0%;
  }
  to {
    min-width: 1%;
  }
`;

type ScanCategoryProps = {
  status: ScanStatus;
  progress: number;
  triggerScan: () => void;
  onClose: () => void;
  cancelScan: () => void;
  isLoading: boolean;
} & WrappedComponentProps;

const ScanCategory = ({
  intl: { formatMessage },
  status,
  progress,
  triggerScan,
  cancelScan,
  onClose,
  isLoading,
}: ScanCategoryProps) => {
  const nlpFeatureFlag = useFeatureFlag({ name: 'insights_nlp_flow' });

  const scanCategoryMessagesMap: Record<
    ScanStatus,
    {
      title: MessageDescriptor;
      description: MessageDescriptor;
      button?: MessageDescriptor;
      action?: () => void;
    }
  > = {
    isIdle: {
      title: messages.categoriesScanTitle,
      description: messages.categoriesScanDescription,
      button: messages.categoriesScanButton,
      action: triggerScan,
    },

    isScanning: {
      title: messages.categoriesScanInProgressTitle,
      description: messages.categoriesScanInProgressDescription,
      button: messages.categoriesCancelScanButton,
      action: cancelScan,
    },

    isFinished: {
      title: messages.categoriesScanDoneTitle,
      description: messages.categoriesScanDoneDescription,
      button: messages.categoriesScanDoneButton,
      action: onClose,
    },
    isError: {
      title: messages.categoriesScanErrorTitle,
      description: messages.categoriesScanErrorDescription,
      button: messages.categoriesScanDoneButton,
      action: onClose,
    },
  };

  if (!nlpFeatureFlag) {
    return null;
  }

  const isInProgress = status === 'isScanning';

  return (
    <ScanContainer data-testid="insightsScanCategory-banner">
      <ProgressBar
        data-testid="insightsScanCategory-progress"
        isInProgress={isInProgress}
        bgColor={colors.primary}
        width={`${progress * 100}%`}
        position="absolute"
        top="0"
        left="0"
        h="6px"
      />
      <Box mr="40px">
        <p className="scanTitle">
          {formatMessage(scanCategoryMessagesMap[status].title)}
        </p>
        <p className="scanDescription">
          {formatMessage(scanCategoryMessagesMap[status].description)}
        </p>
      </Box>
      {scanCategoryMessagesMap[status].button && (
        <Button
          className="intercom-insights-edit-scan-button"
          buttonStyle={
            status === 'isScanning' ? 'admin-dark-outlined' : 'admin-dark'
          }
          borderThickness="2px"
          onClick={scanCategoryMessagesMap[status].action}
          processing={isLoading}
        >
          {formatMessage(
            scanCategoryMessagesMap[status].button as MessageDescriptor
          )}
        </Button>
      )}
    </ScanContainer>
  );
};

export default injectIntl(ScanCategory);
