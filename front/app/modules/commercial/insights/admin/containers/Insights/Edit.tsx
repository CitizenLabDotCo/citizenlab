import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Input } from 'cl2-component-library';
import { isNilOrError } from 'utils/helperUtils';
import { Divider } from 'semantic-ui-react';

import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import useLocale from 'hooks/useLocale';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import { colors, fontSizes } from 'utils/styleUtils';

import TopBar from '../../components/TopBar';
import Error from 'components/UI/Error';
import { CLErrors } from 'typings';
import useInsightsCategories from '../../../hooks/useInsightsCategories';
import { withRouter, WithRouterProps } from 'react-router';

import { addInsightsCategory } from '../../../services/insightsCategories';
import { darken } from 'polished';

const Categories = styled.aside`
  padding: 24px;
  max-width: 300px;
`;

const DetectButton = styled(Button)`
  margin-bottom: 8px;
`;

const ResetButton = styled(Button)`
  margin-bottom: 28px;
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
  input {
    padding: 10px;
    font-size: ${fontSizes.small}px;
  }
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
`;

const CategoryInfoBox = styled.div`
  background-color: ${colors.clBlueLightest};
  font-size: ${fontSizes.base};
  font-color: ${colors.adminTextColor};
  border-radius: 3px;
  padding: 8px 20px;
`;

const EditInsightsView = ({
  intl: { formatMessage },
  params: { viewId },
}: InjectedIntlProps & WithRouterProps) => {
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<CLErrors | undefined>();
  const categories = useInsightsCategories(viewId);
  const [name, setName] = useState<string | null>();
  const [selectedCategory, setSelectedCategory] = useState('');

  const onChangeName = (value: string) => {
    setName(value);
    setErrors(undefined);
  };

  if (isNilOrError(locale) || isNilOrError(categories)) {
    return null;
  }

  const handleCategorySubmit = async () => {
    if (name) {
      setLoading(true);
      try {
        await addInsightsCategory(viewId, name);
      } catch (errors) {
        setErrors(errors.json.errors);
      }
      setLoading(false);
      setName('');
    }
  };

  const selectCategory = (categoryId: string) => () =>
    setSelectedCategory(categoryId);

  return (
    <>
      <TopBar />
      <Categories>
        <>
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
          >
            {formatMessage(messages.resetCategories)}
          </ResetButton>
        </>

        <Divider />
        <CategoriesLabel>{formatMessage(messages.categories)}</CategoriesLabel>
        <FormContainer>
          <Input
            type="text"
            value={name}
            onChange={onChangeName}
            placeholder={formatMessage(messages.addCategory)}
          />
          <Button
            locale={locale}
            fontSize={`${fontSizes.xxxl}px`}
            className="addButton"
            padding="8px 10px"
            onClick={handleCategorySubmit}
            disabled={!name || loading}
          >
            +
          </Button>
        </FormContainer>
        {errors && (
          <Error apiErrors={errors['name']} fieldName="category_name" />
        )}

        {categories.length === 0 ? (
          <CategoryInfoBox>
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
            <CategoryButton
              key={category.id}
              locale={locale}
              bgColor={
                category.id === selectedCategory
                  ? darken(0.05, colors.lightGreyishBlue)
                  : 'transparent'
              }
              textColor={colors.label}
              textHoverColor={colors.adminTextColor}
              bgHoverColor={darken(0.05, colors.lightGreyishBlue)}
              onClick={selectCategory(category.id)}
            >
              <div>{category.attributes.name}</div>
            </CategoryButton>
          ))
        )}
      </Categories>
    </>
  );
};

export default withRouter(injectIntl(EditInsightsView));
