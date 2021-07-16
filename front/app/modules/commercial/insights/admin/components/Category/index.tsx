import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

import useCategory from 'modules/commercial/insights/hooks/useInsightsCategory';
import Tag from 'modules/commercial/insights/admin/components/Tag';
import { deleteInsightsInputCategory } from 'modules/commercial/insights/services/insightsInputs';

import { withRouter, WithRouterProps } from 'react-router';

export type CategoryProps = {
  id: string;
  inputId: string;
} & WithRouterProps;

const Category = ({ id, inputId, params: { viewId } }: CategoryProps) => {
  const [loading, setLoading] = useState(false);
  const category = useCategory(viewId, id);

  if (isNilOrError(category)) {
    return null;
  }
  const handleRemoveCategory = async () => {
    setLoading(true);
    try {
      await deleteInsightsInputCategory(viewId, inputId, id);
    } catch {
      // Do nothing
    }
  };

  return (
    <Tag
      variant="primary"
      label={category.attributes.name}
      onIconClick={handleRemoveCategory}
      loading={loading}
    />
  );
};

export default withRouter(Category);
