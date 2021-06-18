import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';
import useInsightsCategories from 'modules/commercial/insights/hooks/useInsightsCategories';
import Tag from 'modules/commercial/insights/admin/components/Tag';
import styled from 'styled-components';

type CategoryProps = WithRouterProps;

const Container = styled.div`
  background-color: #fff;
  padding: 28px;
`;

const Categories = ({ params: { viewId } }: CategoryProps) => {
  const categories = useInsightsCategories(viewId);
  if (isNilOrError(categories)) {
    return null;
  }

  return (
    <Container>
      {categories.map((category) => (
        <Tag
          key={category.id}
          label={category.attributes.name}
          variant="secondary"
        />
      ))}
    </Container>
  );
};

export default withRouter(Categories);
