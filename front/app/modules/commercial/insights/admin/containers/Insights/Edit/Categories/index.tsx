import React, { useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
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
import useFeatureFlag from 'hooks/useFeatureFlag';
import useInsightsCategories from 'modules/commercial/insights/hooks/useInsightsCategories';
import useInsightsInputsCount from 'modules/commercial/insights/hooks/useInsightsInputsCount';
import useDetectedCategories from 'modules/commercial/insights/hooks/useInsightsDetectedCategories';

// intl
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// types
import { CLErrors } from 'typings';

// services
import {
  addInsightsCategory,
  deleteInsightsCategories,
  deleteInsightsCategory,
} from 'modules/commercial/insights/services/insightsCategories';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from 'modules/commercial/insights/admin/containers/Insights/tracks';

const CategoriesLabel = styled.div`
  display: flex;
  p {
    text-transform: uppercase;
    font-size: ${fontSizes.xs}px;
    color: ${colors.adminTextColor};
    font-weight: bold;
    margin-bottom: 0px;
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
  background-color: ${colors.clBlueLightest};
  font-size: ${fontSizes.base};
  color: ${colors.adminTextColor};
  border-radius: 3px;
  padding: 8px 20px;
`;

const StyledPlus = styled.div`
  width: 22px;
  text-align: center;
`;

const DeletedIcon = styled(Icon)`
  width: 18px;
  height: 18px;
  fill: ${colors.label};
  &:hover {
    fill: ${colors.clRedError};
  }
`;

const Categories = ({
  intl: { formatMessage },
  params: { viewId },
  location: { query, pathname },
}: InjectedIntlProps & WithRouterProps) => {
  const nlpFeatureFlag = useFeatureFlag({ name: 'insights_nlp_flow' });

  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [errors, setErrors] = useState<CLErrors | undefined>();
  const [isDropdownOpened, setDropdownOpened] = useState(false);

  const allInputsCount = useInsightsInputsCount(viewId, { processed: true });
  const uncategorizedInputsCount = useInsightsInputsCount(viewId, {
    categories: [''],
    processed: true,
  });
  const recentlyPostedInputsCount = useInsightsInputsCount(viewId, {
    processed: false,
  });
  const detectedCategories = useDetectedCategories(viewId);
  const categories = useInsightsCategories(viewId);

  const [name, setName] = useState<string | null>();

  if (isNilOrError(categories)) {
    return null;
  }

  const onChangeName = (value: string) => {
    setName(value);
    setErrors(undefined);
  };

  const handleCategorySubmit = async () => {
    if (name) {
      setLoadingAdd(true);
      try {
        await addInsightsCategory({ insightsViewId: viewId, name });
      } catch (errors) {
        setErrors(errors.json.errors);
      }
      setLoadingAdd(false);
      setName('');
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

  const selectRecentlyPosted = () => {
    clHistory.push({
      pathname,
      search: stringify(
        { ...query, pageNumber: 1, category: undefined, processed: false },
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
    setLoadingReset(true);
    if (window.confirm(deleteMessage)) {
      try {
        await deleteInsightsCategories(viewId);
        selectRecentlyPosted();
      } catch {
        // Do nothing
      }
    }
    trackEventByName(tracks.resetCategories);
    setLoadingReset(false);
  };

  const handleDeleteCategory = (categoryId: string) => async (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    {
      e.stopPropagation();
      const deleteMessage = formatMessage(messages.deleteCategoryConfirmation);
      if (window.confirm(deleteMessage)) {
        try {
          await deleteInsightsCategory(viewId, categoryId);
          if (query.category === categoryId) {
            clHistory.replace({
              pathname,
              search: stringify(
                { ...query, category: undefined },
                { addQueryPrefix: true }
              ),
            });
          }
        } catch {
          // Do nothing
        }
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
          bgColor={
            inputsCategoryFilter === 'allInput'
              ? darken(0.05, colors.lightGreyishBlue)
              : 'transparent'
          }
          textColor={colors.label}
          textHoverColor={colors.adminTextColor}
          bgHoverColor={darken(0.05, colors.lightGreyishBlue)}
          onClick={selectAllInput}
        >
          <span> {formatMessage(messages.allInput)}</span>
          {!isNilOrError(allInputsCount) && (
            <span data-testid="insightsAllInputsCount">
              {allInputsCount.count}
            </span>
          )}
        </CategoryButton>
        <CategoryButton
          bgColor={
            inputsCategoryFilter === 'recentlyPosted'
              ? darken(0.05, colors.lightGreyishBlue)
              : 'transparent'
          }
          textColor={colors.label}
          textHoverColor={colors.adminTextColor}
          bgHoverColor={darken(0.05, colors.lightGreyishBlue)}
          onClick={selectRecentlyPosted}
        >
          <span>{formatMessage(messages.recentlyPosted)}</span>
          {!isNilOrError(recentlyPostedInputsCount) && (
            <span data-testid="insightsRecentlyPostedInputsCount">
              {recentlyPostedInputsCount.count}
            </span>
          )}
        </CategoryButton>
        <CategoryButton
          bgColor={
            inputsCategoryFilter === 'notCategorized'
              ? darken(0.05, colors.lightGreyishBlue)
              : 'transparent'
          }
          textColor={colors.label}
          textHoverColor={colors.adminTextColor}
          bgHoverColor={darken(0.05, colors.lightGreyishBlue)}
          onClick={selectUncategorizedInput}
        >
          <span>{formatMessage(messages.notCategorized)}</span>
          {!isNilOrError(uncategorizedInputsCount) && (
            <span data-testid="insightsUncategorizedInputsCount">
              {uncategorizedInputsCount.count}
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
          icon="more-options"
          iconColor={colors.label}
          iconHoverColor={colors.label}
          boxShadow="none"
          boxShadowHover="none"
          bgColor="transparent"
          bgHoverColor="transparent"
          pr="0"
          onClick={toggleDropdown}
          processing={loadingReset}
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
      <Box display="flex" alignItems="center" mb="28px" as="form">
        <Input
          type="text"
          value={name}
          onChange={onChangeName}
          placeholder={formatMessage(messages.addCategory)}
          size="small"
        />
        <Button
          fontSize={`${fontSizes.xxxl}px`}
          bgColor={colors.adminTextColor}
          ml="4px"
          p="8px"
          onClick={handleCategorySubmit}
          disabled={!name || loadingAdd}
        >
          {loadingAdd ? <Spinner size="22px" /> : <StyledPlus>+</StyledPlus>}
        </Button>
      </Box>
      <div>
        {errors && (
          <Error apiErrors={errors['name']} fieldName="category_name" />
        )}
      </div>
      {nlpFeatureFlag &&
        !isNilOrError(detectedCategories) &&
        detectedCategories.length > 0 && (
          <Button
            buttonStyle="white"
            mb="8px"
            textColor={colors.adminTextColor}
            linkTo={`/admin/insights/${viewId}/detect`}
            data-testid="insightsDetectCategories"
          >
            {formatMessage(messages.detectCategories)}
          </Button>
        )}
      {categories.length === 0 ? (
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
        categories.map((category) => (
          <div data-testid="insightsCategory" key={category.id}>
            <CategoryButtonWithIcon
              bgColor={
                category.id === query.category
                  ? darken(0.05, colors.lightGreyishBlue)
                  : 'transparent'
              }
              textColor={colors.label}
              textHoverColor={colors.adminTextColor}
              bgHoverColor={darken(0.05, colors.lightGreyishBlue)}
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
