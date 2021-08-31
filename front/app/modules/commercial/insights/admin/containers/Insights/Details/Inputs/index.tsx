import React, { useCallback } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// utils
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
  inputs: IInsightsInputData[];
  loading: boolean;
  hasMore: boolean | null;
  onLoadMore: () => void;
} & WithRouterProps &
  InjectedIntlProps;

const Inputs = ({
  location: { pathname, query },
  intl: { formatMessage },
  onPreviewInput,
  inputs,
  hasMore,
  onLoadMore,
  loading,
}: InputsProps) => {
  const category = query.category;
  const previewedInputId = query.previewedInputId;

  const onSearch = useCallback(
    (search: string) => {
      clHistory.replace({
        pathname,
        search: stringify(
          { previewedInputId, category, search },
          { addQueryPrefix: true }
        ),
      });
    },
    [previewedInputId, category, pathname]
  );

  return (
    <InputsContainer data-testid="insightsDetailsInputs">
      <StyledSearch onChange={onSearch} size="small" />
      {inputs.length === 0 ? (
        <Empty />
      ) : (
        inputs.map((input) => (
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
