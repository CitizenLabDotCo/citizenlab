import React from 'react';

// components
import HelmetIntl from 'components/HelmetIntl';

// i18n
import messages from './messages';

export default class IdeaDashboard extends React.PureComponent {
  render() {
    return (
      <>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        {this.props.children}
      </>
    );
  }
}
