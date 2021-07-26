import React, { useState, useMemo, useEffect } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// styles
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// intl
import messages from '../../messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';

// services
import { insightsTriggerCategoriesSuggestionsTasks } from 'modules/commercial/insights/services/insightsCategoriesSuggestionsTasks';
import useInsightsCategoriesSuggestionsTasks from 'modules/commercial/insights/hooks/useInsightsCategoriesSuggestionsTasks';

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

const ScanButtonContent = styled.div`
  display: flex;
  align-items: center;
  > div:first-child {
    margin-right: 8px;
  }
`;

const ScanCategory = ({
  intl: { formatMessage },
  params: { viewId },
  location: { query },
}: InjectedIntlProps & WithRouterProps) => {
  const [processing, setProcessing] = useState(false);
  const categories = useMemo(() => [query.category], [query.category]);
  const categorySuggestionsPendingTasks = useInsightsCategoriesSuggestionsTasks(
    viewId,
    { categories }
  );

  useEffect(() => {
    if (
      !isNilOrError(categorySuggestionsPendingTasks) &&
      categorySuggestionsPendingTasks.length === 0
    ) {
      setProcessing(false);
    }
  }, [categorySuggestionsPendingTasks]);

  const suggestCategories = async () => {
    try {
      setProcessing(true);
      await insightsTriggerCategoriesSuggestionsTasks(viewId, categories);
    } catch {
      // Do nothing
    }
  };

  if (isNilOrError(categorySuggestionsPendingTasks)) {
    return null;
  }

  return (
    <ScanContainer data-testid="insightsScanCategory">
      <div className="scanContent">
        <p className="scanTitle">
          {formatMessage(messages.categoriesEmptyScanTitle)}
        </p>
        <p className="scanDescription">
          {formatMessage(messages.categoriesEmptyScanDescription)}
        </p>
      </div>

      <Button
        buttonStyle="admin-dark"
        onClick={suggestCategories}
        processing={processing}
        disabled={processing}
      >
        <ScanButtonContent>
          {formatMessage(messages.categoriesEmptyScanButton)}
        </ScanButtonContent>
      </Button>
    </ScanContainer>
  );
};

export default withRouter(injectIntl(ScanCategory));
