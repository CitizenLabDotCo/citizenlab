import React, { useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { stringify } from 'qs';

// styles
import styled from 'styled-components';
import { darken } from 'polished';

// components
import { Button, Input, Spinner } from 'cl2-component-library';
import Divider from 'components/admin/Divider';

import Error from 'components/UI/Error';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { colors, fontSizes } from 'utils/styleUtils';
import clHistory from 'utils/cl-router/history';
import getInputsCategoryFilter from 'modules/commercial/insights/utils/getInputsCategoryFilter';

// hooks
import useLocale from 'hooks/useLocale';
import useInsightsCategories from 'modules/commercial/insights/hooks/useInsightsCategories';
import useInsightsInputsCount from 'modules/commercial/insights/hooks/useInsightsInputsCount';

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

const Container = styled.aside`
  padding: 24px;
  max-width: 300px;
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  overflow-y: auto;
`;

const DetectButton = styled(Button)`
  margin-bottom: 8px;
`;

const ResetButton = styled(Button)`
  margin-bottom: 20px;
`;

const CategoriesLabel = styled.p`
  text-transform: uppercase;
  font-size: ${fontSizes.xs}px;
  color: ${colors.adminTextColor};
  font-weight: bold;
  padding: 16px;
`;

const FormContainer = styled.form`
  display: flex;
  align-items: center;
  margin-bottom: 28px;
  .addButton {
    margin-left: 4px;
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

const ButtonsContainer = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
`;

const Categories = ({
  intl: { formatMessage },
  params: { viewId },
  location: { query, pathname },
}: InjectedIntlProps & WithRouterProps) => {
  const locale = useLocale();
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [errors, setErrors] = useState<CLErrors | undefined>();
  const allInputsCount = useInsightsInputsCount(viewId, { processed: true });
  const uncategorizedInputsCount = useInsightsInputsCount(viewId, {
    category: '',
    processed: true,
  });
  const recentlyPostedInputsCount = useInsightsInputsCount(viewId, {
    processed: false,
  });

  const categories = useInsightsCategories(viewId);
  const [name, setName] = useState<string | null>();

  if (isNilOrError(locale) || isNilOrError(categories)) {
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

  const selectCategory = (categoryId?: string) => () => {
    clHistory.push({
      pathname,
      search: stringify(
        { ...query, pageNumber: 1, category: categoryId, processed: true },
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

  const handleResetCategories = async () => {
    const deleteMessage = formatMessage(messages.resetCategoriesConfimation);

    setLoadingReset(true);
    if (window.confirm(deleteMessage)) {
      try {
        await deleteInsightsCategories(viewId);
      } catch {
        // Do nothing
      }
    }
    setLoadingReset(false);
  };

  return (
    <Container data-testid="insightsCategories">
      <DetectButton
        buttonStyle="white"
        locale={locale}
        textColor={colors.adminTextColor}
      >
        {formatMessage(messages.detectCategories)}
      </DetectButton>
      <ResetButton
        buttonStyle="white"
        locale={locale}
        textColor={colors.adminTextColor}
        onClick={handleResetCategories}
      >
        {loadingReset ? (
          <Spinner size="22px" />
        ) : (
          formatMessage(messages.resetCategories)
        )}
      </ResetButton>
      <Divider />
      <ButtonsContainer>
        <CategoryButton
          locale={locale}
          bgColor={
            inputsCategoryFilter === 'allInput'
              ? darken(0.05, colors.lightGreyishBlue)
              : 'transparent'
          }
          textColor={colors.label}
          textHoverColor={colors.adminTextColor}
          bgHoverColor={darken(0.05, colors.lightGreyishBlue)}
          onClick={selectCategory()}
        >
          <div> {formatMessage(messages.allInput)}</div>
          {!isNilOrError(allInputsCount) && (
            <div data-testid="insightsAllInputsCount">
              {allInputsCount.count}
            </div>
          )}
        </CategoryButton>
        <CategoryButton
          locale={locale}
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
          locale={locale}
          bgColor={
            inputsCategoryFilter === 'notCategorized'
              ? darken(0.05, colors.lightGreyishBlue)
              : 'transparent'
          }
          textColor={colors.label}
          textHoverColor={colors.adminTextColor}
          bgHoverColor={darken(0.05, colors.lightGreyishBlue)}
          onClick={selectCategory('')}
        >
          <div>{formatMessage(messages.notCategorized)}</div>
          {!isNilOrError(uncategorizedInputsCount) && (
            <div data-testid="insightsUncategorizedInputsCount">
              {uncategorizedInputsCount.count}
            </div>
          )}
        </CategoryButton>
      </ButtonsContainer>
      <CategoriesLabel>{formatMessage(messages.categories)}</CategoriesLabel>
      <FormContainer>
        <Input
          type="text"
          value={name}
          onChange={onChangeName}
          placeholder={formatMessage(messages.addCategory)}
          size="small"
        />
        <Button
          locale={locale}
          fontSize={`${fontSizes.xxxl}px`}
          bgColor={colors.adminTextColor}
          className="addButton"
          padding="8px"
          onClick={handleCategorySubmit}
          disabled={!name || loadingAdd}
        >
          {loadingAdd ? <Spinner size="22px" /> : <StyledPlus>+</StyledPlus>}
        </Button>
      </FormContainer>
      {errors && <Error apiErrors={errors['name']} fieldName="category_name" />}

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
              locale={locale}
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
    </Container>
  );
};
export default withRouter(injectIntl(Categories));
