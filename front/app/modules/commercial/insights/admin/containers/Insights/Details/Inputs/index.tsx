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

// types
import { IInsightsInputData } from 'modules/commercial/insights/services/insightsInputs';

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

type InputsProps = {
  onPreviewInput: (input: IInsightsInputData) => void;
} & WithRouterProps &
  InjectedIntlProps;

const Inputs = ({
  location: { pathname, query },
  intl: { formatMessage },
  onPreviewInput,
  params: { viewId },
}: InputsProps) => {
  const category = query.category;
  const previewedInputId = query.previewedInputId;
  const search = query.search;

  const { list, loading, hasMore, onLoadMore } = useInsightsInputsLoadMore(
    viewId,
    {
      category,
      search,
    }
  );

  const onSearch = useCallback(
    (search: string) => {
      clHistory.replace({
        pathname,
        search: stringify(
          { previewedInputId, category, search, pageNumber: 1 },
          { addQueryPrefix: true }
        ),
      });
    },
    [previewedInputId, category, pathname]
  );

  if (isNilOrError(list)) {
    return null;
  }

  return (
    <InputsContainer data-testid="insightsDetailsInputs">
      <StyledSearch onChange={onSearch} size="small" />
      {list.length === 0 ? (
        <Empty />
      ) : (
        list.map((input) => (
          <InputCard key={input.id} input={input} onReadMore={onPreviewInput} />
        ))
      )}
      {hasMore && (
        <div data-testid="insightsDetailsLoadMore">
          <Button
            processing={loading}
            onClick={onLoadMore}
            buttonStyle="white"
            textColor={colors.adminTextColor}
          >
            {formatMessage(messages.inputsLoadMore)}
          </Button>
        </div>
      )}
    </InputsContainer>
  );
};

export default withRouter(injectIntl(Inputs));
