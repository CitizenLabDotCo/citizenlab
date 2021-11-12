import React from 'react';

// styles
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// intl
import messages from '../../messages';
import { injectIntl } from 'utils/cl-intl';
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
} & InjectedIntlProps;

const ScanCategory = ({
  intl: { formatMessage },
  status,
  progress,
  triggerScan,
}: ScanCategoryProps) => {
  const nlpFeatureFlag = useFeatureFlag({ name: 'insights_nlp_flow' });

  if (!nlpFeatureFlag) {
    return null;
  }

  return (
    <ScanContainer data-testid="insightsScanCategory-banner">
      <div className="scanContent">
        <p className="scanTitle">
          {formatMessage(messages.categoriesEmptyScanTitle)}
        </p>
        <p className="scanDescription">
          {formatMessage(messages.categoriesEmptyScanDescription)}
        </p>
      </div>

      <Button buttonStyle="admin-dark" onClick={triggerScan}>
        {formatMessage(messages.categoriesEmptyScanButton)}
      </Button>
    </ScanContainer>
  );
};

export default injectIntl(ScanCategory);
