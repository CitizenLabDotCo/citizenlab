import * as React from 'react';
import { ICustomFieldData, customFieldForUsersStream } from 'services/userCustomFields';
import { injectResource, InjectedResourceLoaderProps } from 'utils/resourceLoaders/resourceLoader';
// import { FormattedMessage } from 'utils/cl-intl';
// import messages from './messages';

import CustomFieldForm from './Form';

type Props = {};

type State = {};

class Edit extends React.Component<Props & InjectedResourceLoaderProps<ICustomFieldData>, State> {
  render() {
    const { customField } = this.props;
    return customField && (
      <CustomFieldForm
        customField={customField}
      />
    );
  }
}

export default injectResource('customField', customFieldForUsersStream, (props) => (props.params.customFieldId))(Edit);
