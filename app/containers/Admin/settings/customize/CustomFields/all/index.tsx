import * as React from 'react';
import { injectResources, InjectedResourcesLoaderProps } from 'utils/resourceLoaders/resourcesLoader';
import { customFieldsForUsersStream, ICustomFieldData } from 'services/userCustomFields';

import T from 'components/T';
import { Link } from 'react-router';

// import messages from './messages';

type Props = {};

type State = {};

class CustomFields extends React.Component<Props & InjectedResourcesLoaderProps<ICustomFieldData>, State> {

  render() {
    const { customFields } = this.props;
    return (
      <div>
        {customFields && customFields.all && customFields.all.map((field) => (
          <Link
            key={field.id}
            to={`/admin/custom_fields/edit/${field.id}`}
          >
            <T value={field.attributes.title_multiloc} />
          </Link>
        ))}
      </div>
    );
  }
}

export default injectResources('customFields', customFieldsForUsersStream)(CustomFields);
