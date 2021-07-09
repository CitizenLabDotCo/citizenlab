import React, { useMemo } from 'react';
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
import { Spinner } from 'cl2-component-library';

// services
import { insightsSuggestCategories } from 'modules/commercial/insights/services/insightsCategorySuggestions';
import useInsightsCategoriesSuggestions from 'modules/commercial/insights/hooks/useInsightsCategorySuggestions';

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
  const categories = useMemo(() => [query.category], [query.category]);
  const categorySuggestionsPendingTasks = useInsightsCategoriesSuggestions(
    viewId
  );

  const suggestCategories = async () => {
    try {
      await insightsSuggestCategories(viewId, categories);
    } catch {
      // Do nothing
    }
  };

  if (isNilOrError(categorySuggestionsPendingTasks)) {
    return null;
  }

  const loading = Boolean(
    categorySuggestionsPendingTasks.find((pendingTask) =>
      pendingTask.relationships?.categories.data
        .map((category) => category.id)
        .includes(query.category)
    )
  );

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
        disabled={loading}
      >
        <ScanButtonContent>
          {loading && <Spinner size="22px" />}
          {formatMessage(messages.categoriesEmptyScanButton)}
        </ScanButtonContent>
      </Button>
    </ScanContainer>
  );
};

export default withRouter(injectIntl(ScanCategory));
