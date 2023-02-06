import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

import { useCategory } from 'modules/commercial/insights/api/categories';
import Tag, {
  TagProps,
} from 'modules/commercial/insights/admin/components/Tag';
import {
  deleteInsightsInputCategory,
  addInsightsInputCategory,
} from 'modules/commercial/insights/services/insightsInputs';

import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

export type CategoryProps = {
  id: string;
  inputId: string;
  variant: 'suggested' | 'approved';
  size?: TagProps['size'];
  withAction?: boolean;
} & WithRouterProps;

const Category = ({
  id,
  inputId,
  variant,
  size,
  params: { viewId },
  withAction = true,
}: CategoryProps) => {
  const [loading, setLoading] = useState(false);
  const { data: category } = useCategory(viewId, id);

  if (isNilOrError(category)) {
    return null;
  }
  const handleCategoryAction = async () => {
    setLoading(true);
    try {
      if (variant === 'approved') {
        await deleteInsightsInputCategory(viewId, inputId, id);
      } else if (variant === 'suggested') {
        await addInsightsInputCategory(viewId, inputId, id);
      }
    } catch {
      // Do nothing
    }
  };

  return (
    <Tag
      variant={variant === 'suggested' ? 'default' : 'primary'}
      label={category.data.attributes.name}
      onIconClick={withAction ? handleCategoryAction : undefined}
      loading={loading}
      size={size}
    />
  );
};

export default withRouter(Category);
