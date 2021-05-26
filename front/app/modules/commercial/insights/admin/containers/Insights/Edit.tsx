import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Input } from 'cl2-component-library';
import { isNilOrError } from 'utils/helperUtils';
import { Divider } from 'semantic-ui-react';

import { injectIntl } from 'utils/cl-intl';
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

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  input {
    padding: 10px;
    font-size: ${fontSizes.small}px;
  }
  .categoryButton {
    margin-left: 4px;
  }
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

  const onChangeName = (value: string) => {
    setName(value);
    setErrors(undefined);
  };

  if (isNilOrError(locale) || isNilOrError(categories)) {
    return null;
  }

  const handleSubmit = async () => {
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
        <InputContainer>
          <Input
            type="text"
            value={name}
            onChange={onChangeName}
            placeholder={formatMessage(messages.addCategory)}
          />
          <Button
            locale={locale}
            fontSize={`${fontSizes.xxxl}px`}
            className="categoryButton"
            padding="8px 10px"
            onClick={handleSubmit}
            disabled={!name || loading}
          >
            +
          </Button>
        </InputContainer>
        {errors && (
          <Error apiErrors={errors['name']} fieldName="category_name" />
        )}
        {categories.map((category) => (
          <div id={category.id}>{category.attributes.name}</div>
        ))}
      </Categories>
    </>
  );
};

export default withRouter(injectIntl(EditInsightsView));
