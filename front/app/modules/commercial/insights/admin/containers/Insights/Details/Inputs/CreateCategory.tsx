import React, { useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// components
import { Input, Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { SectionField } from 'components/admin/Section';
import Error from 'components/UI/Error';
import Tag from 'modules/commercial/insights/admin/components/Tag';

// styles
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// typings
import { CLErrors } from 'typings';

// services
import {
  addInsightsCategory,
  IInsightsCategoryData,
} from 'modules/commercial/insights/services/insightsCategories';

type CreateCategoryProps = {
  closeCreateModal: () => void;
  keywords: string[];
  categories: IInsightsCategoryData[];
  search?: string;
} & WithRouterProps &
  InjectedIntlProps;

const Title = styled.h1`
  text-align: center;
  font-size: ${fontSizes.xxl}px;
`;

const Description = styled.p`
  text-align: center;
  padding-top: 10px;
  font-size: ${fontSizes.base}px;
`;

const CreateCategory = ({
  closeCreateModal,
  keywords,
  categories,
  search,
  intl: { formatMessage },
  params: { viewId },
}: CreateCategoryProps) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<CLErrors | null>(null);

  const [name, setName] = useState<string | null>(null);
  const onChangeName = (value: string) => {
    setName(value);
    setErrors(null);
  };

  const categoryIds = categories.map((category) => category.id);

  const handleCategorySubmit = async () => {
    if (name) {
      setLoading(true);
      try {
        await addInsightsCategory({
          insightsViewId: viewId,
          name,
          inputs: { categories: categoryIds, search, keywords },
        });
        closeCreateModal();
      } catch (errors) {
        setErrors(errors.json.errors);
      }
      setLoading(false);
    }
  };

  return (
    <Box
      w="100%"
      maxWidth="350px"
      m="40px auto"
      color={colors.adminTextColor}
      data-testid="insightsDetailsCreateCategory"
    >
      <Title>{formatMessage(messages.createCategoryTitle)}</Title>
      <Description>
        {formatMessage(messages.createCategoryDescription)}
      </Description>

      {categories.length > 0 && (
        <Box mb="8px" display="flex" justifyContent="center">
          {categories.map((category) => (
            <Tag
              key={category.id}
              mr="4px"
              mb="4px"
              variant="primary"
              label={category.attributes.name}
            />
          ))}
        </Box>
      )}

      {keywords.length > 0 && (
        <Box mb="8px" display="flex" justifyContent="center">
          {keywords.map((keyword: string) => (
            <Tag
              key={keyword}
              mr="4px"
              mb="4px"
              variant="secondary"
              label={keyword.substring(keyword.indexOf('/') + 1)}
            />
          ))}
        </Box>
      )}

      {search && (
        <Box display="flex" justifyContent="center">
          <p>
            {formatMessage(messages.createCategorySearch)}:{' '}
            <strong>{search}</strong>
          </p>
        </Box>
      )}

      <Box as="form" mt="40px">
        <SectionField>
          <Input
            type="text"
            id="category_name"
            value={name}
            onChange={onChangeName}
            label={formatMessage(messages.createCategoryInputLabel)}
          />
          {errors && (
            <Error apiErrors={errors['name']} fieldName="category_name" />
          )}
        </SectionField>

        <Box display="flex" justifyContent="center">
          <Button
            processing={loading}
            disabled={!name}
            onClick={handleCategorySubmit}
            bgColor={colors.adminTextColor}
            data-testid="insightsDetailsCreateCategoryConfirm"
          >
            {formatMessage(messages.createCategoryConfirm)}
          </Button>
          <Button onClick={closeCreateModal} buttonStyle="secondary" ml="5px">
            {formatMessage(messages.createCategoryCancel)}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default injectIntl(withRouter(CreateCategory));
