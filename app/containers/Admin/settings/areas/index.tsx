import * as React from 'react';

import messages from '../messages';
import { Section, SectionTitle } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';

export default class AdminSettingsAreas extends React.PureComponent {
  render() {
    return (
      <Section key={'signup_fields'}>
        <SectionTitle>
          <FormattedMessage {...messages.titleAreas} />
        </SectionTitle>
      </Section>
    );
  }
}
