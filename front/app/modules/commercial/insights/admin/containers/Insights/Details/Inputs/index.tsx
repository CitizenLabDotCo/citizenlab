import React, { useCallback, useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// utils
import clHistory from 'utils/cl-router/history';
import { stringify, parse } from 'qs';
import { isNilOrError } from 'utils/helperUtils';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// components
import { Box, IconTooltip } from '@citizenlab/cl2-component-library';
import Search from 'components/UI/SearchInput';
import InputCard from './InputCard';
import Empty from './Empty';
import Button from 'components/UI/Button';
import Tag from 'modules/commercial/insights/admin/components/Tag';
import Modal from 'components/UI/Modal';
import CreateCategory from './CreateCategory';
import Export from './Export';
import {
  TooltipContent,
  SectionTitle,
} from 'modules/commercial/insights/admin/components/StyledTextComponents';

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
import useInsightsInputsCount from 'modules/commercial/insights/hooks/useInsightsInputsCount';

const InputsContainer = styled.div`
  flex: 0 0 420px;
  padding: 12px 20px 0px 20px;
  height: 100%;
  background-color: ${colors.emailBg};
  border-left: 1px solid ${colors.separation};
  display: flex;
  flex-direction: column;
`;

const StyledSearch = styled(Search)`
  margin-bottom: 12px;
`;

const StyledInputCount = styled.span`
  font-weight: normal;
  font-size: ${fontSizes.small}px;
  margin-left: 8px;
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
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const categories = useInsightsCategories(viewId);

  const queryCategories: string[] = query.categories
    ? typeof query.categories === 'string'
      ? [query.categories]
      : query.categories
    : [];

  const keywords: string[] = query.keywords
    ? typeof query.keywords === 'string'
      ? [query.keywords]
      : query.keywords
    : [];

  const selectedCategories = !isNilOrError(categories)
    ? categories.filter((category) => queryCategories.includes(category.id))
    : [];

  const inputsCount = useInsightsInputsCount(viewId, {
    keywords,
    categories: selectedCategories.map(({ id }) => id),
    search: query.search,
  });

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

  const onKeywordIconClick = (keyword: string) => () => {
    clHistory.replace({
      pathname,
      search: stringify(
        { ...query, keywords: keywords.filter((item) => item !== keyword) },
        { addQueryPrefix: true, indices: false }
      ),
    });
  };

  const closeCreateModal = () => setCreateModalOpened(false);
  const openCreateModal = () => setCreateModalOpened(true);

  return (
    <InputsContainer data-testid="insightsDetailsInputs">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <SectionTitle>
          {formatMessage(messages.inputsSectionTitle)}
          {!isNilOrError(inputsCount) && (
            <StyledInputCount>{inputsCount?.count}</StyledInputCount>
          )}
          <IconTooltip
            ml="8px"
            placement="bottom-start"
            content={
              <TooltipContent>
                {formatMessage(messages.inputsSectionTitleTooltip)}
              </TooltipContent>
            }
          />
        </SectionTitle>
        {inputs.length > 0 && <Export />}
      </Box>
      <StyledSearch onChange={onSearch} size="small" />
      {selectedCategories.length > 0 && (
        <Box mb="8px">
          <Box mr="4px" as="span">
            {formatMessage(messages.inputsTags)}
          </Box>
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
      )}
      {keywords.length > 0 && (
        <Box mb="12px">
          <Box mr="4px" as="span">
            {formatMessage(messages.inputsKeywords)}
          </Box>
          {keywords.map((keyword: string) => (
            <Tag
              key={keyword}
              mr="4px"
              mb="4px"
              variant="secondary"
              label={keyword.substring(keyword.indexOf('/') + 1)}
              onIconClick={onKeywordIconClick(keyword)}
            />
          ))}
        </Box>
      )}

      {inputs.length === 0 ? (
        <Empty />
      ) : (
        <>
          <Button
            buttonStyle="white"
            mb="12px"
            textColor={colors.label}
            icon="file-add"
            onClick={openCreateModal}
            data-testid="insightsDetailsCreateCategory"
            disabled={
              keywords.length === 0 &&
              selectedCategories.length === 0 &&
              !query.search
            }
          >
            {formatMessage(messages.saveAsCategory)}
          </Button>
          <Box
            overflowY="auto"
            alignSelf="stretch"
            display="flex"
            flexDirection="column"
          >
            {inputs.map((input) => (
              <InputCard
                key={input.id}
                input={input}
                onPreview={onPreviewInput}
              />
            ))}
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
          </Box>
        </>
      )}
      <Modal opened={createModalOpened} close={closeCreateModal}>
        <CreateCategory
          search={query.search ? query.search : undefined}
          keywords={keywords}
          categories={selectedCategories}
          closeCreateModal={closeCreateModal}
        />
      </Modal>
    </InputsContainer>
  );
};

export default withRouter(injectIntl(Inputs));
