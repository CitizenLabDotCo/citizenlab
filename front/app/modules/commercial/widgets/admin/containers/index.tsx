import React, { PureComponent } from 'react';
import IdeasWidget from './IdeasWidget';
import { SectionTitle, SectionDescription } from 'components/admin/Section';

import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

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
