import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

import useCategory from 'modules/commercial/insights/api/categories/useCategory';
import Tag, {
  TagProps,
} from 'modules/commercial/insights/admin/components/Tag';

import useAddInputCategories from 'modules/commercial/insights/api/inputs/useAddInputCategories';

import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import useDeleteInputCategory from 'modules/commercial/insights/api/inputs/useDeleteInputCategory';

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
  const { mutate: addInputCategories, isLoading: addInputCategoriesIsLoading } =
    useAddInputCategories();
  const {
    mutate: deleteInputCategory,
    isLoading: deleteInputCategoriesIsLoading,
  } = useDeleteInputCategory();
  const { data: category } = useCategory(viewId, id);

  if (isNilOrError(category)) {
    return null;
  }
  const handleCategoryAction = () => {
    if (variant === 'approved') {
      deleteInputCategory({ viewId, inputId, categoryId: id });
    } else if (variant === 'suggested') {
      addInputCategories({
        viewId,
        inputId,
        categories: [{ id, type: 'category' }],
      });
    }
  };

  return (
    <Tag
      variant={variant === 'suggested' ? 'default' : 'primary'}
      label={category.data.attributes.name}
      onIconClick={withAction ? handleCategoryAction : undefined}
      loading={addInputCategoriesIsLoading || deleteInputCategoriesIsLoading}
      size={size}
    />
  );
};

export default withRouter(Category);
