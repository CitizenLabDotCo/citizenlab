import { SectionDescription, SectionTitle } from 'components/admin/Section';
import React, { PureComponent } from 'react';
import IdeasWidget from './IdeasWidget';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

export default class AdminSettingsWidgets extends PureComponent {
  render() {
    return (
      <>
        <SectionTitle>
          <FormattedMessage {...messages.titleWidgets} />
        </SectionTitle>
        <SectionDescription>
          <FormattedMessage {...messages.subtitleWidgets} />
        </SectionDescription>
        <IdeasWidget />
      </>
    );
  }
}
