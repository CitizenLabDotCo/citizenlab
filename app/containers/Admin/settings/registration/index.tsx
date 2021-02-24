import React, { PureComponent } from 'react';
import AllCustomFields from './CustomFields/All';
import {
  Section,
  SectionTitle,
  SectionField,
  SectionDescription,
  SubSectionTitle,
} from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import { IconTooltip } from 'cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

type Props = {};

type State = {};

class SettingsRegistrationTab extends PureComponent<Props, State> {
  render() {
    return (
      <Section key={'signup_fields'}>
        <SectionTitle>
          <FormattedMessage {...messages.titleRegistration} />
        </SectionTitle>
        <SectionDescription>
          <FormattedMessage {...messages.subtitleRegistration} />
        </SectionDescription>
        <AllCustomFields />
        <Section key={'project_header'}>
          <SubSectionTitle>
            <FormattedMessage {...messages.project_header} />
            <IconTooltip
              content={
                <FormattedMessage {...messages.project_header_tooltip} />
              }
            />
          </SubSectionTitle>
          {/* <SectionField>
            <InputMultilocWithLocaleSwitcher
              type="text"
              valueMultiloc={
                get(
                  attributesDiff,
                  'settings.core.currently_working_on_text'
                ) ||
                get(
                  tenant,
                  'data.attributes.settings.core.currently_working_on_text'
                )
              }
              onChange={this.handleProjectHeaderOnChange}
              errorMultiloc={subtitleError}
            />
          </SectionField> */}
        </Section>
      </Section>
    );
  }
}

export default SettingsRegistrationTab;
