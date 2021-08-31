import React, { useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// utils
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';

// hooks
import useInsightsCategories from 'modules/commercial/insights/hooks/useInsightsCategories';

// components
import Tag from 'modules/commercial/insights/admin/components/Tag';
import { Box, IconTooltip } from 'cl2-component-library';
import Button from 'components/UI/Button';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// intl
import messages from '../../messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

type CategoryProps = WithRouterProps & InjectedIntlProps;

const CategoriesTitle = styled.h1`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.large}px;
  display: flex;
  align-items: center;
  .iconTooltip {
    margin-left: 10px;
  }
`;

const StyledTag = styled(Tag)`
  margin-right: 8px;
  margin-bottom: 8px;
`;

const EmptyStateTitle = styled.p`
  margin: 0;
  padding: 0;
  font-size: ${fontSizes.base}px;
  font-weight: bold;
`;

export const visibleCategoriesNumber = 6;

const Categories: React.FC<CategoryProps> = ({
  location: { pathname, query },
  params: { viewId },
  intl: { formatMessage },
  children,
}) => {
  const [seeAllCategories, setSeeAllCategories] = useState(false);
  const categories = useInsightsCategories(viewId);

  if (isNilOrError(categories)) {
    return null;
  }

  const handleCategoryClick = (id: string) => () => {
    const category = query.category === id ? undefined : id;
    clHistory.push({
      pathname,
      search: stringify(
        { ...query, category, pageNumber: 1 },
        { addQueryPrefix: true }
      ),
    });
  };

  const toggleSeeAllCategories = () => {
    setSeeAllCategories(!seeAllCategories);
  };

  return (
    <Box display="flex" flexDirection="column" w="100%" h="100%">
      <Box
        bgColor="#fff"
        padding="28px"
        data-testid="insightsDetailsCategories"
      >
        <CategoriesTitle>
          {formatMessage(messages.categoriesTitle)}
          <IconTooltip
            className="iconTooltip"
            content={formatMessage(messages.categoriesTitleTooltip)}
          />
        </CategoriesTitle>
        {categories.length > 0 ? (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box w="70%">
              {categories
                // Filter visible categories
                .filter((_, i) =>
                  !seeAllCategories ? i < visibleCategoriesNumber : true
                )
                .map((category) => (
                  <StyledTag
                    key={category.id}
                    label={category.attributes.name}
                    variant={
                      query.category === category.id ? 'primary' : 'default'
                    }
                    count={category.attributes.inputs_count}
                    onClick={handleCategoryClick(category.id)}
                  />
                ))}
              <Box display="flex">
                {categories.length > visibleCategoriesNumber && (
                  <Button
                    buttonStyle="text"
                    padding="0px"
                    onClick={toggleSeeAllCategories}
                  >
                    {seeAllCategories
                      ? formatMessage(messages.categoriesSeeLess)
                      : formatMessage(messages.categoriesSeeAll)}
                  </Button>
                )}
              </Box>
            </Box>
            <Button
              buttonStyle="admin-dark"
              linkTo={`${pathname}/edit`}
              icon="categories"
              iconPos="right"
            >
              {formatMessage(messages.editCategories)}
            </Button>
          </Box>
        ) : (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            padding="16px 24px"
            bgColor={colors.clBlueLightest}
            color={colors.adminTextColor}
            borderRadius="3px"
            data-testid="insightsDetailsCategoriesEmpty"
          >
            <Box w="80%">
              <EmptyStateTitle className="title">
                {formatMessage(messages.categoriesEmptyTitle)}
              </EmptyStateTitle>
              <p> {formatMessage(messages.categoriesEmptyDescription)}</p>
            </Box>

            <Button
              buttonStyle="admin-dark"
              linkTo={`${pathname}/edit`}
              icon="categories"
              iconPos="right"
            >
              {formatMessage(messages.categoriesEmptyButton)}
            </Button>
          </Box>
        )}
      </Box>
      {children}
    </Box>
  );
};

export default withRouter(injectIntl(Categories));
