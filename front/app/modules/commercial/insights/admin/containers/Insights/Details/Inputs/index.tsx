import React, { useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';
import Search from 'components/UI/SearchInput';
import { colors } from 'utils/styleUtils';
import useInsightsInputsLoadMore from 'modules/commercial/insights/hooks/useInsightsInputsLoadMore';
import InputCard from './InputCard';
import Button from 'components/UI/Button';

const InputsContainer = styled.div`
  min-width: 420px;
  overflow-x: auto;
  padding: 20px;
  background-color: ${colors.emailBg};
  border-left: 1px solid ${colors.separation};
`;

const Inputs = ({ params: { viewId } }: WithRouterProps) => {
  const [page, setPage] = useState(1);
  const { list, loading } = useInsightsInputsLoadMore(viewId, {
    pageNumber: page,
  });

  if (isNilOrError(list)) {
    return null;
  }

  const handleSearchChange = () => {};

  const onLoadMore = () => {
    setPage(page + 1);
  };

  return (
    <InputsContainer>
      <Search onChange={handleSearchChange} size="small" />
      {list.map((input) => (
        <InputCard key={input.id} />
      ))}
      <Button processing={loading} onClick={onLoadMore}>
        Load more
      </Button>
    </InputsContainer>
  );
};

export default withRouter(Inputs);
