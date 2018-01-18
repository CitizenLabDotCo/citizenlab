import * as React from 'react';

// components
import HelmetIntl from 'components/HelmetIntl';

// i18n
import messages from './messages';

type Props = {};

type State = {};

export default class ProjectDashboard extends React.PureComponent<Props, State> {
  render() {
    return (
      <>
        <HelmetIntl title={messages.helmetTitle} description={messages.helmetDescription} />
        {this.props.children}
      </>
    );
  }
}
