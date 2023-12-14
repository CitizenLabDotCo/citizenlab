import React, { useState } from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// components
import {
  Input,
  Box,
  fontSizes,
  colors,
} from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { SectionField } from 'components/admin/Section';
import Error from 'components/UI/Error';
import Tag from 'modules/commercial/insights/admin/components/Tag';

// styles
import styled from 'styled-components';

// intl
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../../messages';

// api
import useAddCategory from 'modules/commercial/insights/api/categories/useAddCategory';
import { IInsightsCategoryData } from 'modules/commercial/insights/api/categories/types';

type CreateCategoryProps = {
  closeCreateModal: () => void;
  keywords: string[];
  categories: IInsightsCategoryData[];
  search?: string;
} & WithRouterProps &
  WrappedComponentProps;

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
  const { mutate: addCategory, isLoading, error, reset } = useAddCategory();

  const [name, setName] = useState<string | null>(null);
  const onChangeName = (value: string) => {
    setName(value);
    reset();
  };

  const categoryIds = categories.map((category) => category.id);

  const handleCategorySubmit = () => {
    if (name) {
      addCategory(
        {
          viewId,
          category: {
            name,
            inputs: { categories: categoryIds, search, keywords },
          },
        },
        {
          onSuccess: closeCreateModal,
        }
      );
    }
  };

  return (
    <Box
      w="100%"
      maxWidth="350px"
      m="40px auto"
      color={colors.primary}
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
          {error && (
            <Error apiErrors={error.errors['name']} fieldName="category_name" />
          )}
        </SectionField>

        <Box display="flex" justifyContent="center">
          <Button
            processing={isLoading}
            disabled={!name}
            onClick={handleCategorySubmit}
            bgColor={colors.primary}
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
const withhocs = injectIntl(withRouter(CreateCategory));

export default withhocs;
