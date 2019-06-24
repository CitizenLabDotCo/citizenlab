import React from 'react';
import Loadable from 'react-loadable';
import { Props } from 'components/CustomFieldsForm';

const LoadableCustomFieldsForm = Loadable({
  loading: () => null,
  loader: () => import('components/CustomFieldsForm'),
  render(loaded, props: Props) {
    const CustomFieldsForm = loaded.default;

    return <CustomFieldsForm {...props} />;
  }
});

export default LoadableCustomFieldsForm;
