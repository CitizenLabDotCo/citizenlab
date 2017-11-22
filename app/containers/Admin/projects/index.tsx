import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import HelmetIntl from 'components/HelmetIntl';

// store
import { preprocess } from 'utils';

// messages
import messages from './messages';
import { resetProjects } from 'resources/projects/actions';

type Props = {};

type State = {};

export default class ProjectDashboard extends React.PureComponent<Props, State> {
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
