import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';
import useInsightsCategories from 'modules/commercial/insights/hooks/useInsightsCategories';
import Tag from 'modules/commercial/insights/admin/components/Tag';

type CategoryProps = WithRouterProps;

const Categories = ({ params: { viewId } }: CategoryProps) => {
  const categories = useInsightsCategories(viewId);
  if (isNilOrError(categories)) {
    return null;
  }

  return (
    <>
      {categories.map((category) => (
        <Tag
          key={category.id}
          label={category.attributes.name}
          variant="secondary"
        />
      ))}
    </>
  );
};

export default withRouter(Categories);
