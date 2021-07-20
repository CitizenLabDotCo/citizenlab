import React, { useCallback } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';
import Search from 'components/UI/SearchInput';
import { colors } from 'utils/styleUtils';
import useInsightsInputsLoadMore from 'modules/commercial/insights/hooks/useInsightsInputsLoadMore';
import InputCard from './InputCard';
import Button from 'components/UI/Button';
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';

const InputsContainer = styled.div`
  min-width: 420px;
  overflow-x: auto;
  padding: 20px;
  background-color: ${colors.emailBg};
  border-left: 1px solid ${colors.separation};
`;

const Inputs = ({
  params: { viewId },
  location: { pathname, query },
}: WithRouterProps) => {
  const category = query.category;
  const search = query.search;
  const page = query.page ? Number(query.page) : 1;

  const { list, loading, hasMore } = useInsightsInputsLoadMore(viewId, {
    category,
    search,
    pageNumber: page,
  });

  // Search
  const onSearch = useCallback((search: string) => {
    clHistory.replace({
      pathname,
      search: stringify(
        { ...query, search, page: 1 },
        { addQueryPrefix: true }
      ),
    });
  }, []);

  const onLoadMore = () => {
    clHistory.replace({
      pathname,
      search: stringify(
        { ...query, search, page: page + 1 },
        { addQueryPrefix: true }
      ),
    });
  };

  if (isNilOrError(list)) {
    return null;
  }

  return (
    <InputsContainer>
      <Search onChange={onSearch} size="small" />
      {list.map((input) => (
        <InputCard key={input.id} />
      ))}
      {hasMore && (
        <Button
          processing={loading}
          onClick={onLoadMore}
          buttonStyle="secondary-outlined"
        >
          Load more
        </Button>
      )}
    </InputsContainer>
  );
};

export default withRouter(Inputs);
