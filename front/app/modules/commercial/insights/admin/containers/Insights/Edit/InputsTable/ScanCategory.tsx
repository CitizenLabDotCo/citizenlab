import React, { useMemo, useEffect, useState } from 'react';
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

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from 'modules/commercial/insights/admin/containers/Insights/tracks';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

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

type ScanCategoryVariant = 'button' | 'banner';

type ScanCategoryProps = {
  variant: ScanCategoryVariant;
} & InjectedIntlProps &
  WithRouterProps;

const ScanCategory = ({
  intl: { formatMessage },
  params: { viewId },
  location: { query },
  variant,
}: ScanCategoryProps) => {
  const [loading, setLoading] = useState(false);
  const nlpFeatureFlag = useFeatureFlag('insights_nlp_flow');
  const categories = useMemo(() => [query.category], [query.category]);
  const categorySuggestionsPendingTasks = useInsightsCategoriesSuggestionsTasks(
    viewId,
    { categories }
  );

  useEffect(() => {
    if (
      !isNilOrError(categorySuggestionsPendingTasks) &&
      categorySuggestionsPendingTasks.length > 0
    ) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [categorySuggestionsPendingTasks, categories]);

  const suggestCategories = async () => {
    try {
      setLoading(true);
      await insightsTriggerCategoriesSuggestionsTasks(viewId, categories);
    } catch {
      // Do nothing
    }
    trackEventByName(tracks.scanForSuggestions);
  };

  if (isNilOrError(categorySuggestionsPendingTasks) || !nlpFeatureFlag) {
    return null;
  }

  return variant === 'banner' ? (
    <ScanContainer data-testid="insightsScanCategory-banner">
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
        disabled={loading}
        processing={loading}
      >
        {formatMessage(messages.categoriesEmptyScanButton)}
      </Button>
    </ScanContainer>
  ) : (
    <div data-testid="insightsScanCategory-button">
      <Button
        buttonStyle="secondary"
        textColor={colors.adminTextColor}
        onClick={suggestCategories}
        disabled={loading}
        processing={loading}
      >
        {formatMessage(messages.categoriesEmptyScanButton)}
      </Button>
    </div>
  );
};

export default withRouter(injectIntl(ScanCategory));
