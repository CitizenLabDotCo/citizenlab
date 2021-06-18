import React, { useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { stringify } from 'qs';

// styles
import styled from 'styled-components';
import { darken } from 'polished';

// components
import {
  Button,
  Input,
  Spinner,
  IconTooltip,
  Dropdown,
  DropdownListItem,
} from 'cl2-component-library';
import Divider from 'components/admin/Divider';
import Modal from 'components/UI/Modal';
import TopBar, { topBarHeight } from '../../../components/TopBar';
import Error from 'components/UI/Error';
import InputsTable from './InputsTable';
import RenameCategory from './RenameCategory';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { colors, fontSizes, stylingConsts, media } from 'utils/styleUtils';
import clHistory from 'utils/cl-router/history';

// hooks
import useLocale from 'hooks/useLocale';
import useInsightsCategories from 'modules/commercial/insights/hooks/useInsightsCategories';

// intl
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// types
import { CLErrors } from 'typings';

// services
import {
  addInsightsCategory,
  deleteInsightsCategories,
  deleteInsightsCategory,
} from 'modules/commercial/insights/services/insightsCategories';

const Container = styled.div`
  height: calc(100vh - ${stylingConsts.menuHeight + topBarHeight}px);
  display: flex;
  position: fixed;
  right: 0;
  top: ${stylingConsts.menuHeight + topBarHeight}px;
  left: 210px;
  bottom: 0;
  ${media.smallerThan1280px`
    left: 80px;
  `}
`;

const Inputs = styled.div`
  flex: 1;
  background: #fff;
  overflow-x: auto;
  overflow-y: auto;
  padding: 40px;
`;

const Categories = styled.aside`
  padding: 24px;
  max-width: 300px;
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
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
    white-space: normal !important;
  }
`;

const CategoryInfoBox = styled.div`
  background-color: ${colors.clBlueLightest};
  font-size: ${fontSizes.base};
  font-color: ${colors.adminTextColor};
  border-radius: 3px;
  padding: 8px 20px;
`;

const CategoriesList = styled.div`
  overflow-y: auto;
`;

const StyledPlus = styled.div`
  width: 22px;
  text-align: center;
`;

const ButtonsContainer = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
`;

const StyledHeader = styled.h2`
  display: flex;
  align-items: center;
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.large}px;
  button {
    margin-left: 20px;
  }
`;

const EditInsightsView = ({
  intl: { formatMessage },
  params: { viewId },
  location: { query, pathname },
}: InjectedIntlProps & WithRouterProps) => {
  const locale = useLocale();
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [errors, setErrors] = useState<CLErrors | undefined>();

  const categories = useInsightsCategories(viewId);
  const [name, setName] = useState<string | null>();
  const onChangeName = (value: string) => {
    setName(value);
    setErrors(undefined);
  };
  const [renameCategoryModalOpened, setRenameCategoryModalOpened] = useState(
    false
  );
  const [isCategoryMenuOpened, setCategoryMenuOpened] = useState(false);

  const closeCategoryRenameModal = () => setRenameCategoryModalOpened(false);
  const openCategoryRenameModal = () => setRenameCategoryModalOpened(true);

  const toggleCategoryMenu = () => {
    setCategoryMenuOpened(!isCategoryMenuOpened);
  };

  const closeCategoryMenu = () => {
    setCategoryMenuOpened(false);
  };

  if (isNilOrError(locale) || isNilOrError(categories)) {
    return null;
  }

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

  const handleDeleteCategory = async () => {
    {
      const deleteMessage = formatMessage(messages.deleteCategoryConfirmation);
      if (window.confirm(deleteMessage)) {
        try {
          await deleteInsightsCategory(viewId, query.category);
        } catch {
          // Do nothing
        }
      }
      clHistory.push({
        pathname,
        search: stringify(
          { ...query, pageNumber: 1, category: undefined },
          { addQueryPrefix: true }
        ),
      });
      setCategoryMenuOpened(false);
    }
  };

  const selectCategory = (categoryId: string) => () => {
    clHistory.push({
      pathname,
      search: stringify(
        { ...query, pageNumber: 1, category: categoryId },
        { addQueryPrefix: true }
      ),
    });
  };

  const selectedCategory = categories?.find(
    (category) => category.id === query.category
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
    <div data-testid="insightsEdit">
      <TopBar />
      <Container>
        <Categories>
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
                !query.category
                  ? darken(0.05, colors.lightGreyishBlue)
                  : 'transparent'
              }
              textColor={colors.label}
              textHoverColor={colors.adminTextColor}
              bgHoverColor={darken(0.05, colors.lightGreyishBlue)}
              onClick={selectCategory('')}
            >
              {formatMessage(messages.allInput)}
            </CategoryButton>
          </ButtonsContainer>
          <CategoriesLabel>
            {formatMessage(messages.categories)}
          </CategoriesLabel>
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
              {loadingAdd ? (
                <Spinner size="22px" />
              ) : (
                <StyledPlus>+</StyledPlus>
              )}
            </Button>
          </FormContainer>
          {errors && (
            <Error apiErrors={errors['name']} fieldName="category_name" />
          )}
          <CategoriesList>
            {categories.length === 0 ? (
              <CategoryInfoBox data-testid="insightsNoCategories">
                <p>
                  <FormattedMessage
                    {...messages.categoryInfoBox}
                    values={{
                      bold: (
                        <b>{formatMessage(messages.categoryInfoBoxBold)}</b>
                      ),
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
                    {category.attributes.name}
                  </CategoryButton>
                </div>
              ))
            )}
          </CategoriesList>
        </Categories>
        <Inputs>
          <StyledHeader data-testid="insightsInputsHeader">
            {selectedCategory ? (
              <>
                {selectedCategory.attributes.name}
                <Button
                  icon="more-options"
                  locale={locale}
                  iconColor={colors.label}
                  iconHoverColor={colors.label}
                  boxShadow="none"
                  boxShadowHover="none"
                  bgColor="transparent"
                  bgHoverColor="transparent"
                  padding="0px 20px"
                  onClick={toggleCategoryMenu}
                />
              </>
            ) : (
              <>
                {formatMessage(messages.allInput)}
                <IconTooltip
                  content={formatMessage(messages.allInputTooltip)}
                />
              </>
            )}
          </StyledHeader>
          <Dropdown
            opened={isCategoryMenuOpened}
            onClickOutside={closeCategoryMenu}
            className="dropdown"
            content={
              <>
                <DropdownListItem onClick={openCategoryRenameModal}>
                  {formatMessage(messages.editCategoryName)}
                </DropdownListItem>
                <DropdownListItem onClick={handleDeleteCategory}>
                  {formatMessage(messages.deleteCategory)}
                </DropdownListItem>
              </>
            }
          />
          <Divider />
          <InputsTable />
        </Inputs>
        <Modal
          opened={renameCategoryModalOpened}
          close={closeCategoryRenameModal}
        >
          {selectedCategory && (
            <RenameCategory
              closeRenameModal={closeCategoryRenameModal}
              originalCategoryName={selectedCategory.attributes.name}
            />
          )}
        </Modal>
      </Container>
    </div>
  );
};

export default withRouter(injectIntl(EditInsightsView));
