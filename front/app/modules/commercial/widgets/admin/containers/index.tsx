import React, { PureComponent } from 'react';
import { FormattedMessage } from 'utils/cl-intl';
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import messages from '../messages';
import IdeasWidget from './IdeasWidget';

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
