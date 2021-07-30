import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

import useCategory from 'modules/commercial/insights/hooks/useInsightsCategory';
import Tag, {
  TagProps,
} from 'modules/commercial/insights/admin/components/Tag';
import {
  deleteInsightsInputCategory,
  addInsightsInputCategory,
} from 'modules/commercial/insights/services/insightsInputs';

import { withRouter, WithRouterProps } from 'react-router';

export type CategoryProps = {
  id: string;
  inputId: string;
  variant: 'suggested' | 'approved';
  size?: TagProps['size'];
} & WithRouterProps;

const Category = ({
  id,
  inputId,
  variant,
  size,
  params: { viewId },
}: CategoryProps) => {
  const [loading, setLoading] = useState(false);
  const category = useCategory(viewId, id);

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
      label={category.attributes.name}
      onIconClick={handleCategoryAction}
      loading={loading}
      size={size}
    />
  );
};

export default withRouter(Category);
