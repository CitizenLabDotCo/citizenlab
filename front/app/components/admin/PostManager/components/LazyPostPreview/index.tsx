import { lazy } from 'react';

export default lazy(
  () =>
    import(
      'components/admin/PostManager/components/LazyPostPreview/PostPreview'
    )
);
