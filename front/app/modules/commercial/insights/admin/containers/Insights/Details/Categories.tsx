import React, { useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// utils
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';

// hooks
import useInsightsCategories from 'modules/commercial/insights/hooks/useInsightsCategories';
import { IconTooltip } from 'cl2-component-library';
import Button from 'components/UI/Button';

// components
import Tag from 'modules/commercial/insights/admin/components/Tag';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// intl
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

type CategoryProps = WithRouterProps & InjectedIntlProps;

const Container = styled.div`
  background-color: #fff;
  padding: 28px;

  h1 {
    color: ${colors.adminTextColor};
    font-size: ${fontSizes.large}px;
    display: flex;
    align-items: center;
    button {
      margin-left: 10px;
    }
  }
`;

const CategoriesContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  .categoriesList {
    width: 70%;
  }
  .categoryTag {
    margin-right: 8px;
    margin-bottom: 8px;
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: ${colors.clBlueLightest};
  color: ${colors.adminTextColor};
  border-radius: 3px;

  .content {
    width: 80%;
  }

  .title {
    margin: 0;
    padding: 0;
    font-size: ${fontSizes.base}px;
    font-weight: bold;
  }
`;

const CategoriesButtonContainer = styled.div`
  display: flex;
`;

export const visibleCategoriesNumber = 8;

const Categories = ({
  location: { pathname, query },
  params: { viewId },
  intl: { formatMessage },
}: CategoryProps) => {
  const [seeAllCategories, setSeeAllCategories] = useState(false);
  const categories = useInsightsCategories(viewId);

  if (isNilOrError(categories)) {
    return null;
  }

  const handleCategoryClick = (id: string) => () => {
    const category = query.category === id ? undefined : id;
    clHistory.push({
      pathname,
      search: stringify({ ...query, category }, { addQueryPrefix: true }),
    });
  };

  const toggleSeeAllCategories = () => {
    setSeeAllCategories(!seeAllCategories);
  };

  return (
    <Container data-testid="insightsDetailsCategories">
      <h1>
        {formatMessage(messages.categoriesTitle)}
        <IconTooltip content={formatMessage(messages.categoriesTitleTooltip)} />
      </h1>
      {categories.length > 0 ? (
        <CategoriesContainer>
          <div className="categoriesList">
            {categories
              // Filter visible categories
              .filter((_, i) =>
                !seeAllCategories ? i < visibleCategoriesNumber : true
              )
              .map((category) => (
                <Tag
                  key={category.id}
                  label={category.attributes.name}
                  variant={
                    query.category === category.id ? 'primary' : 'default'
                  }
                  count={category.attributes.inputs_count}
                  className="categoryTag"
                  onClick={handleCategoryClick(category.id)}
                />
              ))}
            <CategoriesButtonContainer>
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
            </CategoriesButtonContainer>
          </div>
          <Button
            buttonStyle="admin-dark"
            linkTo={`${pathname}/edit`}
            icon="categories"
            iconPos="right"
          >
            {formatMessage(messages.editCategories)}
          </Button>
        </CategoriesContainer>
      ) : (
        <EmptyStateContainer data-testid="insightsDetailsCategoriesEmpty">
          <div className="content">
            <p className="title">
              {formatMessage(messages.categoriesEmptyTitle)}
            </p>
            <p> {formatMessage(messages.categoriesEmptyDescription)}</p>
          </div>

          <Button
            buttonStyle="admin-dark"
            linkTo={`${pathname}/edit`}
            icon="categories"
            iconPos="right"
          >
            {formatMessage(messages.categoriesEmptyButton)}
          </Button>
        </EmptyStateContainer>
      )}
    </Container>
  );
};

export default withRouter(injectIntl(Categories));
