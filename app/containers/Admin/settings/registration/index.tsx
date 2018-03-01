import * as React from 'react';

import BuiltInFields from './BuiltInFields';
import AllCustomFields from './CustomFields/All';
import FeatureFlag from 'components/FeatureFlag';

import messages from '../messages';
import { Section, SectionTitle } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';

type Props = {};

type State = {};

class SettingsRegistrationTab extends React.Component<Props, State> {

  render() {
    const Acf = AllCustomFields as any;
    return (
      <>

        <FeatureFlag name="demographic_fields">
          <Section key={'signup_fields'}>
            <SectionTitle>
              <FormattedMessage {...messages.titleBuiltInRegistrationFields} />
            </SectionTitle>
            <BuiltInFields />
          </Section>

        </FeatureFlag>
        <FeatureFlag name="user_custom_fields">
          <Section key={'signup_fields'}>
            <SectionTitle>
              <FormattedMessage {...messages.titleConfigurableRegistrationFields} />
            </SectionTitle>
            <Acf />
          </Section>
        </FeatureFlag>
      </>
    );
  }
}

export default SettingsRegistrationTab;
