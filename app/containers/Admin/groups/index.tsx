// Libraries
import * as React from 'react';

// store
import { preprocess } from 'utils';

// Components
import HelmetIntl from 'components/HelmetIntl';

// i18n
import messages from './messages';

class GroupsDashboard extends React.PureComponent {
  render() {
    return (
      <div>
      <HelmetIntl
        title={messages.helmetTitle}
        description={messages.helmetDescription}
      />
      {this.props.children}
    </div>
  );
  }
}

export default preprocess(null, null)(GroupsDashboard);
