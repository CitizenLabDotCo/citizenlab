import React, { useState } from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { stringify } from 'qs';

// styles
import styled from 'styled-components';
import { darken } from 'polished';

// components
import {
  Input,
  Spinner,
  Box,
  Dropdown,
  DropdownListItem,
  Icon,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

import Error from 'components/UI/Error';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { colors, fontSizes } from 'utils/styleUtils';
import clHistory from 'utils/cl-router/history';
import getInputsCategoryFilter from 'modules/commercial/insights/utils/getInputsCategoryFilter';

// hooks

// api
import useCategories from 'modules/commercial/insights/api/categories/useCategories';
import useAddCategory from 'modules/commercial/insights/api/categories/useAddCategory';
import useDeleteCategory from 'modules/commercial/insights/api/categories/useDeleteCategory';
import useDeleteAllCategories from 'modules/commercial/insights/api/categories/useDeleteAllCategories';
import useStat from 'modules/commercial/insights/api/stats/useStat';

// intl
import { WrappedComponentProps } from 'react-intl';
import messages from '../../messages';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from 'modules/commercial/insights/admin/containers/Insights/tracks';

const CategoriesLabel = styled.div`
  display: flex;
  align-items: center;
  p {
    text-transform: uppercase;
    font-size: ${fontSizes.xs}px;
    color: ${colors.primary};
    font-weight: bold;
    margin-right: 8px;
  }
`;

const CategoryButton = styled(Button)`
  display: block;
  .button {
    display: flex;
    justify-content: space-between;
  }
  .buttonText {
    width: 100%;
    display: flex;
    justify-content: space-between;
    > span:first-child {
      white-space: nowrap;
      width: 80%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`;

const CategoryButtonWithIcon = styled(CategoryButton)`
  .buttonIcon {
    display: none;
  }

  .buttonCountText {
    display: block;
  }

  &:hover {
    .buttonIcon {
      display: block;
    }
    .buttonCountText {
      display: none;
    }
  }
`;

const CategoryInfoBox = styled.div`
  background-color: ${colors.teal100};
  font-size: ${fontSizes.base}px;
  color: ${colors.primary};
  border-radius: 3px;
  padding: 8px 20px;
`;

const StyledPlus = styled.div`
  width: 22px;
  text-align: center;
`;

const DeletedIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  width: 20px;
  height: 20px;
  &:hover {
    fill: ${colors.red600};
  }
`;

const Categories = ({
  intl: { formatMessage },
  params: { viewId },
  location: { query, pathname },
}: WrappedComponentProps & WithRouterProps) => {
  const [name, setName] = useState<string | null>();
  const { mutate: addCategory, isLoading, error, reset } = useAddCategory();

  const { mutate: deleteCategory } = useDeleteCategory();

  const selectRecentlyPosted = () => {
    clHistory.push({
      pathname,
      search: stringify(
        { ...query, pageNumber: 1, category: undefined, processed: false },
        { addQueryPrefix: true }
      ),
    });
  };

  const {
    mutate: deleteAllCategories,
    isLoading: isDeleteAllCategoriesLoading,
  } = useDeleteAllCategories();
  const [isDropdownOpened, setDropdownOpened] = useState(false);

  const { data: allInputsCount } = useStat(viewId, { processed: true });
  const { data: uncategorizedInputsCount } = useStat(viewId, {
    categories: [''],
    processed: true,
  });
  const { data: recentlyPostedInputsCount } = useStat(viewId, {
    processed: false,
  });

  const { data: categories } = useCategories(viewId);

  if (isNilOrError(categories)) {
    return null;
  }

  const onChangeName = (value: string) => {
    setName(value);
    reset();
  };

  const handleCategorySubmit = () => {
    if (name) {
      addCategory(
        { viewId, category: { name } },
        {
          onSuccess: () => setName(''),
        }
      );
    }
  };

  const selectAllInput = () => {
    clHistory.push({
      pathname,
      search: stringify(
        { ...query, pageNumber: 1, category: undefined, processed: true },
        { addQueryPrefix: true }
      ),
    });
  };

  const selectUncategorizedInput = () => {
    clHistory.push({
      pathname,
      search: stringify(
        { ...query, pageNumber: 1, category: '', processed: true },
        { addQueryPrefix: true }
      ),
    });
  };

  const selectCategory = (categoryId?: string) => () => {
    clHistory.push({
      pathname,
      search: stringify(
        { ...query, pageNumber: 1, category: categoryId, processed: undefined },
        { addQueryPrefix: true }
      ),
    });
  };

  const inputsCategoryFilter = getInputsCategoryFilter(
    query.category,
    query.processed
  );

  const toggleDropdown = () => {
    setDropdownOpened(!isDropdownOpened);
  };

  const closeDropdown = () => {
    setDropdownOpened(false);
  };

  const handleResetCategories = async () => {
    const deleteMessage = formatMessage(messages.resetCategoriesConfimation);
    closeDropdown();

    if (window.confirm(deleteMessage)) {
      deleteAllCategories(viewId, {
        onSuccess: selectRecentlyPosted,
      });
    }
    trackEventByName(tracks.resetCategories);
  };

  const handleDeleteCategory =
    (categoryId: string) => async (e: React.MouseEvent<HTMLDivElement>) => {
      {
        e.stopPropagation();
        const deleteMessage = formatMessage(
          messages.deleteCategoryConfirmation
        );
        if (window.confirm(deleteMessage)) {
          deleteCategory(
            { viewId, categoryId },
            {
              onSuccess: (categoryId) => {
                if (query.category === categoryId) {
                  clHistory.replace({
                    pathname,
                    search: stringify(
                      { ...query, category: undefined },
                      { addQueryPrefix: true }
                    ),
                  });
                }
              },
            }
          );
        }
      }
    };

  return (
    <Box
      data-testid="insightsCategories"
      padding="24px"
      maxWidth="300px"
      flex="0 0 300px"
      display="flex"
      flexDirection="column"
      alignItems="stretch"
      overflowY="auto"
      as="aside"
    >
      <Box my="20px">
        <CategoryButton
          className="intercom-insights-edit-all-tags"
          bgColor={
            inputsCategoryFilter === 'allInput'
              ? darken(0.05, colors.grey200)
              : 'transparent'
          }
          textColor={colors.textSecondary}
          textHoverColor={colors.primary}
          bgHoverColor={darken(0.05, colors.grey200)}
          onClick={selectAllInput}
        >
          <span> {formatMessage(messages.allInput)}</span>
          {!isNilOrError(allInputsCount) && (
            <span data-testid="insightsAllInputsCount">
              {allInputsCount.data.count}
            </span>
          )}
        </CategoryButton>
        <CategoryButton
          className="intercom-insights-edit-recently-posted-tags"
          bgColor={
            inputsCategoryFilter === 'recentlyPosted'
              ? darken(0.05, colors.grey200)
              : 'transparent'
          }
          textColor={colors.textSecondary}
          textHoverColor={colors.primary}
          bgHoverColor={darken(0.05, colors.grey200)}
          onClick={selectRecentlyPosted}
        >
          <span>{formatMessage(messages.recentlyPosted)}</span>
          {!isNilOrError(recentlyPostedInputsCount) && (
            <span data-testid="insightsRecentlyPostedInputsCount">
              {recentlyPostedInputsCount.data.count}
            </span>
          )}
        </CategoryButton>
        <CategoryButton
          className="intercom-insights-edit-not-categorized"
          bgColor={
            inputsCategoryFilter === 'notCategorized'
              ? darken(0.05, colors.grey200)
              : 'transparent'
          }
          textColor={colors.textSecondary}
          textHoverColor={colors.primary}
          bgHoverColor={darken(0.05, colors.grey200)}
          onClick={selectUncategorizedInput}
        >
          <span>{formatMessage(messages.notCategorized)}</span>
          {!isNilOrError(uncategorizedInputsCount) && (
            <span data-testid="insightsUncategorizedInputsCount">
              {uncategorizedInputsCount.data.count}
            </span>
          )}
        </CategoryButton>
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        position="relative"
        p="8px"
      >
        <CategoriesLabel>
          <p>{formatMessage(messages.categories)}</p>
          <IconTooltip
            content={formatMessage(messages.categoriesTooltip)}
            placement="top-start"
          />
        </CategoriesLabel>
        <Button
          icon="dots-horizontal"
          iconColor={colors.textSecondary}
          iconHoverColor={colors.textSecondary}
          boxShadow="none"
          boxShadowHover="none"
          bgColor="transparent"
          bgHoverColor="transparent"
          pr="0"
          onClick={toggleDropdown}
          processing={isDeleteAllCategoriesLoading}
          data-testid="insightsResetMenu"
        />
        <Dropdown
          opened={isDropdownOpened}
          onClickOutside={closeDropdown}
          className="dropdown"
          right="0px"
          top="40px"
          content={
            <DropdownListItem
              onClick={handleResetCategories}
              data-testid="insightsResetButton"
            >
              {formatMessage(messages.resetCategories)}
            </DropdownListItem>
          }
        />
      </Box>
      <Box
        display="flex"
        alignItems="center"
        mb="28px"
        as="form"
        className="intercom-insights-edit-add-tag-form"
      >
        <Input
          type="text"
          value={name}
          onChange={onChangeName}
          placeholder={formatMessage(messages.addCategory)}
          size="small"
        />
        <Button
          fontSize={`${fontSizes.xxxl}px`}
          bgColor={colors.primary}
          ml="4px"
          p="8px"
          onClick={handleCategorySubmit}
          disabled={!name || isLoading}
        >
          {isLoading ? <Spinner size="22px" /> : <StyledPlus>+</StyledPlus>}
        </Button>
      </Box>
      <div>
        {error && (
          <Error apiErrors={error.errors['name']} fieldName="category_name" />
        )}
      </div>
      {categories.data.length === 0 ? (
        <CategoryInfoBox data-testid="insightsNoCategories">
          <p>
            <FormattedMessage
              {...messages.categoryInfoBox}
              values={{
                bold: <b>{formatMessage(messages.categoryInfoBoxBold)}</b>,
              }}
            />
          </p>
        </CategoryInfoBox>
      ) : (
        categories.data.map((category) => (
          <div data-testid="insightsCategory" key={category.id}>
            <CategoryButtonWithIcon
              bgColor={
                category.id === query.category
                  ? darken(0.05, colors.grey200)
                  : 'transparent'
              }
              textColor={colors.textSecondary}
              textHoverColor={colors.primary}
              bgHoverColor={darken(0.05, colors.grey200)}
              onClick={selectCategory(category.id)}
            >
              <span>{category.attributes.name}</span>
              <span
                className="buttonCountText"
                data-testid="insightsCategoryCount"
              >
                {category.attributes.inputs_count}
              </span>
              <span
                className="buttonIcon"
                role="button"
                onClick={handleDeleteCategory(category.id)}
                data-testid="insightsDeleteCategoryIcon"
              >
                <DeletedIcon name="delete" />
              </span>
            </CategoryButtonWithIcon>
          </div>
        ))
      )}
    </Box>
  );
};
export default withRouter(injectIntl(Categories));
