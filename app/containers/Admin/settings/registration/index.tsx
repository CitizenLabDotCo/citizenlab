import React from 'react';
import styled from 'styled-components';
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

const LabelTooltip = styled.div`
  display: flex;
`;

interface Props {}

const SettingsRegistrationTab = (_props: Props) => {
  const handleProjectHeaderOnChange = () => {};
  return (
    <Section key={'signup_fields'}>
      <SectionTitle>
        <FormattedMessage {...messages.titleRegistration} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.subtitleRegistration} />
      </SectionDescription>
      <SubSectionTitle>
        <FormattedMessage {...messages.signupFormText} />
        <IconTooltip
          content={<FormattedMessage {...messages.signupFormTooltip} />}
        />
      </SubSectionTitle>
      <SectionField>
        <InputMultilocWithLocaleSwitcher
          type="text"
          valueMultiloc={{}}
          onChange={handleProjectHeaderOnChange}
          label={
            <LabelTooltip>
              <FormattedMessage {...messages.firstPage} />
              <IconTooltip
                content={<FormattedMessage {...messages.firstPageTooltip} />}
              />
            </LabelTooltip>
          }
        />
      </SectionField>
      <SectionField>
        <InputMultilocWithLocaleSwitcher
          type="text"
          valueMultiloc={{}}
          onChange={handleProjectHeaderOnChange}
          label={
            <LabelTooltip>
              <FormattedMessage {...messages.secondPage} />
              <IconTooltip
                content={<FormattedMessage {...messages.secondPageTooltip} />}
              />
            </LabelTooltip>
          }
        />
      </SectionField>
      <AllCustomFields />
    </Section>
  );
};

export default SettingsRegistrationTab;
