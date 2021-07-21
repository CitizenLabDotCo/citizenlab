import React, { useCallback } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// utils
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// components
import Search from 'components/UI/SearchInput';
import InputCard from './InputCard';
import Empty from './Empty';
import Button from 'components/UI/Button';

// hooks
import useInsightsInputsLoadMore from 'modules/commercial/insights/hooks/useInsightsInputsLoadMore';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

const InputsContainer = styled.div`
  flex: 0 0 420px;
  overflow-x: auto;
  padding: 20px;
  background-color: ${colors.emailBg};
  border-left: 1px solid ${colors.separation};
`;

const StyledSearch = styled(Search)`
  margin-bottom: 20px;
`;

const Inputs = ({
  params: { viewId },
  location: { pathname, query },
  intl: { formatMessage },
}: WithRouterProps & InjectedIntlProps) => {
  const category = query.category;
  const search = query.search;
  const pageNumber = query.pageNumber ? Number(query.pageNumber) : 1;

  const { list, loading, hasMore } = useInsightsInputsLoadMore(viewId, {
    category,
    search,
    pageNumber,
  });

  const onSearch = useCallback(
    (search: string) => {
      clHistory.replace({
        pathname,
        search: stringify(
          { category, search, pageNumber: 1 },
          { addQueryPrefix: true }
        ),
      });
    },
    [category, pathname]
  );

  const onLoadMore = () => {
    clHistory.replace({
      pathname,
      search: stringify(
        { ...query, search, pageNumber: pageNumber + 1 },
        { addQueryPrefix: true }
      ),
    });
  };

  if (isNilOrError(list)) {
    return null;
  }

  return (
    <InputsContainer data-testid="insightsDetailsInputs">
      <StyledSearch onChange={onSearch} size="small" />
      {list.length === 0 ? (
        <Empty />
      ) : (
        list.map((input) => <InputCard key={input.id} input={input} />)
      )}
      {hasMore && (
        <div data-testid="insightsDetailsLoadMore">
          <Button processing={loading} onClick={onLoadMore} buttonStyle="white">
            {formatMessage(messages.inputsLoadMore)}
          </Button>
        </div>
      )}
    </InputsContainer>
  );
};

export default withRouter(injectIntl(Inputs));
