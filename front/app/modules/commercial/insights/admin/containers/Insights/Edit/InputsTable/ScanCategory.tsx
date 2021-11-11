import React, { useMemo } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// styles
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// intl
import messages from '../../messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// components
import Button from 'components/UI/Button';

// services
import useInsightsCategoriesSuggestionsTasks from 'modules/commercial/insights/hooks/useInsightsCategoriesSuggestionsTasks';

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
  const nlpFeatureFlag = useFeatureFlag({ name: 'insights_nlp_flow' });
  const categories = useMemo(() => [query.category], [query.category]);
  const {
    loading,
    suggestCategories,
  } = useInsightsCategoriesSuggestionsTasks(viewId, { categories });

  if (!nlpFeatureFlag) {
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
