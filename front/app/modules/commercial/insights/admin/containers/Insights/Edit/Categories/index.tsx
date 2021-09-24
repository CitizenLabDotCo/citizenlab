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
} from 'cl2-component-library';
import Divider from 'components/admin/Divider';
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
} from 'modules/commercial/insights/services/insightsCategories';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from 'modules/commercial/insights/admin/containers/Insights/tracks';

const CategoriesLabel = styled.p`
  text-transform: uppercase;
  font-size: ${fontSizes.xs}px;
  color: ${colors.adminTextColor};
  font-weight: bold;
  margin: 0px;
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
    > div:first-child {
      white-space: nowrap;
      width: 80%;
      overflow: hidden;
      text-overflow: ellipsis;
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

const Categories = ({
  intl: { formatMessage },
  params: { viewId },
  location: { query, pathname },
}: InjectedIntlProps & WithRouterProps) => {
  const nlpFeatureFlag = useFeatureFlag('insights_nlp_flow');

  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [errors, setErrors] = useState<CLErrors | undefined>();
  const [isDropdownOpened, setDropdownOpened] = useState(false);

  const allInputsCount = useInsightsInputsCount(viewId, { processed: true });
  const uncategorizedInputsCount = useInsightsInputsCount(viewId, {
    category: '',
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
        await addInsightsCategory(viewId, name);
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
      } catch {
        // Do nothing
      }
    }
    trackEventByName(tracks.resetCategories);
    setLoadingReset(false);
    selectRecentlyPosted();
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
    >
      <Divider />
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
          <div> {formatMessage(messages.allInput)}</div>
          {!isNilOrError(allInputsCount) && (
            <div data-testid="insightsAllInputsCount">
              {allInputsCount.count}
            </div>
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
          <div>{formatMessage(messages.recentlyPosted)}</div>
          {!isNilOrError(recentlyPostedInputsCount) && (
            <div data-testid="insightsRecentlyPostedInputsCount">
              {recentlyPostedInputsCount.count}
            </div>
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
          <div>{formatMessage(messages.notCategorized)}</div>
          {!isNilOrError(uncategorizedInputsCount) && (
            <div data-testid="insightsUncategorizedInputsCount">
              {uncategorizedInputsCount.count}
            </div>
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
        <CategoriesLabel>{formatMessage(messages.categories)}</CategoriesLabel>
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
            <CategoryButton
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
              <div>{category.attributes.name}</div>
              <div data-testid="insightsCategoryCount">
                {category.attributes.inputs_count}
              </div>
            </CategoryButton>
          </div>
        ))
      )}
    </Box>
  );
};
export default withRouter(injectIntl(Categories));
