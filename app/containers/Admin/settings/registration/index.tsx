import React from 'react';

import AllCustomFields from './CustomFields/All';

import messages from '../messages';
import { Section, SectionTitle } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';

type Props = {};

type State = {};

class SettingsRegistrationTab extends React.Component<Props, State> {

  render() {
    return (
      <Section key={'signup_fields'}>
        <SectionTitle>
          <FormattedMessage {...messages.titleRegistrationFields} />
        </SectionTitle>
        <AllCustomFields />
      </Section>
    );
  }
}

export default SettingsRegistrationTab;
