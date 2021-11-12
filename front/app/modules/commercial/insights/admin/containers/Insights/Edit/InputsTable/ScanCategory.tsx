import React from 'react';

// styles
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// intl
import messages from '../../messages';
import { injectIntl, MessageDescriptor } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// components
import Button from 'components/UI/Button';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import { ScanStatus } from 'modules/commercial/insights/hooks/useScanInsightsCategory';

const ScanContainer = styled.div`
  width: 100%;
  background-color: ${colors.clBlueLightest};
  padding: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${colors.adminTextColor};
  text-align: left;
  border-radius: 3px;
  .scanContent {
    margin-right: 40px;
  }
  .scanTitle {
    font-weight: bold;
    font-size: ${fontSizes.base}px;
    padding-bottom: 8px;
    margin: 0;
  }
  .scanDescription {
    font-size: ${fontSizes.small}px;
  }
`;

type ScanCategoryProps = {
  status: ScanStatus;
  progress: number;
  triggerScan: () => void;
  onClose: () => void;
} & InjectedIntlProps;

const scanCategoryMessagesMap: Record<
  ScanStatus,
  {
    title: MessageDescriptor;
    description: MessageDescriptor;
    button?: MessageDescriptor;
  }
> = {
  isIdle: {
    title: messages.categoriesScanTitle,
    description: messages.categoriesScanDescription,
    button: messages.categoriesScanButton,
  },
  isInitializingScanning: {
    title: messages.categoriesScanInProgressTitle,
    description: messages.categoriesScanInProgressDescription,
  },
  isScanning: {
    title: messages.categoriesScanInProgressTitle,
    description: messages.categoriesScanInProgressDescription,
  },
  isFinished: {
    title: messages.categoriesScanDoneTitle,
    description: messages.categoriesScanDoneDescription,
    button: messages.categoriesScanDoneButton,
  },
};

const ScanCategory = ({
  intl: { formatMessage },
  status,
  // progress,
  triggerScan,
  onClose,
}: ScanCategoryProps) => {
  const nlpFeatureFlag = useFeatureFlag({ name: 'insights_nlp_flow' });

  if (!nlpFeatureFlag) {
    return null;
  }

  return (
    <ScanContainer data-testid="insightsScanCategory-banner">
      <div className="scanContent">
        <p className="scanTitle">
          {formatMessage(scanCategoryMessagesMap[status].title)}
        </p>
        <p className="scanDescription">
          {formatMessage(scanCategoryMessagesMap[status].description)}
        </p>
      </div>
      {scanCategoryMessagesMap[status].button && (
        <Button
          buttonStyle="admin-dark"
          onClick={status === 'isIdle' ? triggerScan : onClose}
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
