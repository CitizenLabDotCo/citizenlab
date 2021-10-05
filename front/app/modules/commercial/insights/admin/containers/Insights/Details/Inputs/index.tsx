import React, { useCallback } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// utils
import clHistory from 'utils/cl-router/history';
import { stringify, parse } from 'qs';
import { isNilOrError } from 'utils/helperUtils';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// components
import { Box } from 'cl2-component-library';
import Search from 'components/UI/SearchInput';
import InputCard from './InputCard';
import Empty from './Empty';
import Button from 'components/UI/Button';
import Tag from 'modules/commercial/insights/admin/components/Tag';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// types
import { IInsightsInputData } from 'modules/commercial/insights/services/insightsInputs';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from 'modules/commercial/insights/admin/containers/Insights/tracks';

// hooks
import useInsightsCategories from 'modules/commercial/insights/hooks/useInsightsCategories';

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
  params: { viewId },
  location: { pathname, query },
  intl: { formatMessage },
  onPreviewInput,
  inputs,
  hasMore,
  onLoadMore,
  loading,
}: InputsProps) => {
  const categories = useInsightsCategories(viewId);

  // Query parameters are stringified to reduce dependencies in onSearch useCallback
  const stringifiedQueryParameters = stringify(query);

  const onSearch = useCallback(
    (search: string) => {
      clHistory.replace({
        pathname,
        search: stringify(
          { ...parse(stringifiedQueryParameters), search },
          { addQueryPrefix: true, indices: false }
        ),
      });
      trackEventByName(tracks.filterViewBySearch, { search });
    },
    [stringifiedQueryParameters, pathname]
  );

  if (isNilOrError(categories)) {
    return null;
  }

  const queryCategories: string[] = query.categories
    ? typeof query.categories === 'string'
      ? [query.categories]
      : query.categories
    : [];

  const onCategoryIconClick = (category: string) => () => {
    clHistory.replace({
      pathname,
      search: stringify(
        {
          ...query,
          categories: queryCategories.filter((item) => item !== category),
        },
        { addQueryPrefix: true, indices: false }
      ),
    });
  };

  const selectedCategories = categories.filter((category) =>
    queryCategories.includes(category.id)
  );

  const keywords: string[] = query.keywords
    ? typeof query.keywords === 'string'
      ? [query.keywords]
      : query.keywords
    : [];

  const onIconClick = (keyword: string) => () => {
    clHistory.replace({
      pathname,
      search: stringify(
        { ...query, keywords: keywords.filter((item) => item !== keyword) },
        { addQueryPrefix: true, indices: false }
      ),
    });
  };

  return (
    <InputsContainer data-testid="insightsDetailsInputs">
      <StyledSearch onChange={onSearch} size="small" />
      <Box mb="10px">
        {selectedCategories.map((category) => (
          <Tag
            key={category.id}
            mr="4px"
            mb="4px"
            variant="primary"
            label={category.attributes.name}
            onIconClick={onCategoryIconClick(category.id)}
          />
        ))}
      </Box>
      <Box mb="20px">
        {keywords.map((keyword: string) => (
          <Tag
            key={keyword}
            mr="4px"
            mb="4px"
            variant="secondary"
            label={keyword.substring(keyword.indexOf('/') + 1)}
            onIconClick={onIconClick(keyword)}
          />
        ))}
      </Box>
      {inputs.length === 0 ? (
        <Empty />
      ) : (
        inputs.map((input) => (
          <InputCard key={input.id} input={input} onReadMore={onPreviewInput} />
        ))
      )}
      {hasMore && (
        <Button
          processing={loading}
          onClick={onLoadMore}
          buttonStyle="white"
          textColor={colors.adminTextColor}
          data-testid="insightsDetailsLoadMore"
        >
          {formatMessage(messages.inputsLoadMore)}
        </Button>
      )}
    </InputsContainer>
  );
};

export default withRouter(injectIntl(Inputs));
