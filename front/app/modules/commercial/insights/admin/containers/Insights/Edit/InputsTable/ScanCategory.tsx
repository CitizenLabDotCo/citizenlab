import React, { useState } from 'react';
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
import { Spinner } from 'cl2-component-library';

// services
import { insightsSuggestCategories } from 'modules/commercial/insights/services/insightsCategorySuggestions';

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

const ScanCategory = ({
  intl: { formatMessage },
  params: { viewId },
  location: { query },
}: InjectedIntlProps & WithRouterProps) => {
  const [loading, setLoading] = useState(false);
  const suggestCategories = async () => {
    try {
      setLoading(true);
      await insightsSuggestCategories(viewId, [query.category]);
    } catch {
      // Do nothing
    }
    setLoading(false);
  };
  return (
    <ScanContainer>
      <div className="scanContent">
        <p className="scanTitle">
          {formatMessage(messages.categoriesEmptyScanTitle)}
        </p>
        <p className="scanDescription">
          {formatMessage(messages.categoriesEmptyScanDescription)}
        </p>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <Button buttonStyle="admin-dark" onClick={suggestCategories}>
          {formatMessage(messages.categoriesEmptyScanButton)}
        </Button>
      )}
    </ScanContainer>
  );
};

export default withRouter(injectIntl(ScanCategory));
