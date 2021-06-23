import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';
import useInsightsCategories from 'modules/commercial/insights/hooks/useInsightsCategories';
import Tag from 'modules/commercial/insights/admin/components/Tag';
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import { IconTooltip } from 'cl2-component-library';
import Button from 'components/UI/Button';

type CategoryProps = WithRouterProps & InjectedIntlProps;

const Container = styled.div`
  background-color: #fff;
  padding: 28px;
  display: flex;
  justify-content: space-between;
  h1 {
    color: ${colors.adminTextColor};
    font-size: ${fontSizes.large}px;
    display: flex;
    align-items: center;
    button {
      margin-left: 10px;
    }
  }
  .categoryTag {
    margin-right: 8px;
  }
`;

const Categories = ({
  location: { pathname },
  params: { viewId },
  intl: { formatMessage },
}: CategoryProps) => {
  const categories = useInsightsCategories(viewId);
  if (isNilOrError(categories)) {
    return null;
  }

  return (
    <Container>
      <div>
        <h1>
          {formatMessage(messages.categoriesTitle)}
          <IconTooltip
            content={formatMessage(messages.categoriesTitleTooltip)}
          />
        </h1>

        {categories.map((category) => (
          <Tag
            key={category.id}
            label={category.attributes.name}
            variant="secondary"
            count={category.attributes.inputs_count}
            className="categoryTag"
          />
        ))}
      </div>
      <Button buttonStyle="admin-dark" linkTo={`${pathname}/edit`}>
        {formatMessage(messages.editCategories)}
      </Button>
    </Container>
  );
};

export default withRouter(injectIntl(Categories));

// editCategories: {
//   id: 'app.containers.Admin.Insights.Details.editCategories',
//   defaultMessage: 'Edit categories',
// },
// categoriesTitle: {
//   id: 'app.containers.Admin.Insights.Details.categoriesTitle',
//   defaultMessage: 'Categories',
// },
// categoriesTitleTooltip: {
//   id: 'app.containers.Admin.Insights.Details.categoriesTitleTooltip',
//   defaultMessage:
//     'Categories help structure your input. You can edit your categories at any time or use them as filter on the visualisation below.',
// },
// categoriesSeeAll: {
//   id: 'app.containers.Admin.Insights.Details.categoriesSeeAll',
//   defaultMessage: 'See all',
// },
// categoriesEmptyTitle: {
//   id: 'app.containers.Admin.Insights.Details.categoriesEmptyTitle',
//   defaultMessage: "Organize the input you've received",
// },
// categoriesEmptyDescription: {
//   id: 'app.containers.Admin.Insights.Details.categoriesEmptyDescription',
//   defaultMessage: 'Define the categories you want to group your input into.',
// },
// categoriesEmptyButton: {
//   id: 'app.containers.Admin.Insights.Details.categoriesEmptyButton',
//   defaultMessage: 'Create categories',
// },
