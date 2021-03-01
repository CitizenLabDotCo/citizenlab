import React, { useState } from 'react';
import styled from 'styled-components';
import getSubmitState from 'utils/getSubmitState';
import { isCLErrorJSON } from 'utils/errorUtils';

import {
  IUpdatedAppConfigurationProperties,
  updateAppConfiguration,
  IAppConfigurationSettings,
} from 'services/appConfiguration';

// components
import AllCustomFields from './CustomFields/All';
import {
  Section,
  SectionTitle,
  SectionField,
  SectionDescription,
} from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import { IconTooltip } from 'cl2-component-library';
import SubmitWrapper from 'components/admin/SubmitWrapper';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const LabelTooltip = styled.div`
  display: flex;
`;

const SignUpFieldsSection = styled.div`
  margin-bottom: 60px;
`;

interface Props {}

interface IAttributesDiff {
  settings?: Partial<IAppConfigurationSettings>;
}

const SettingsRegistrationTab = (_props: Props) => {
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [isFormSaved, setIsFormSaved] = useState(false);
  const [attributesDiff, setAttributesDiff] = useState<IAttributesDiff>({});

  const handleProjectHeaderOnChange = () => {};

  const validateForm = () => {
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setIsFormSubmitting(true);
    event.preventDefault();

    if (validateForm()) {
      setIsFormSubmitting(true);
      setIsFormSaved(false);

      try {
        await updateAppConfiguration(
          attributesDiff as IUpdatedAppConfigurationProperties
        );

        setIsFormSubmitting(false);
        setIsFormSaved(true);
        setAttributesDiff({});
      } catch (error) {
        setIsFormSubmitting(true);
        setIsFormSaved(false);
        // setErrors(isCLErrorJSON(error) ? error.json.errors : error);
      }
    }
  };
  return (
    <>
      <SignUpFieldsSection key={'signup_fields'}>
        <SectionTitle>
          <FormattedMessage {...messages.signupFormText} />
        </SectionTitle>
        <SectionDescription>
          <FormattedMessage {...messages.signupFormTooltip} />
        </SectionDescription>
        {/* <SubSectionTitle>
        <FormattedMessage {...messages.signupFormText} />
        <IconTooltip
          content={<FormattedMessage {...messages.signupFormTooltip} />}
        />
      </SubSectionTitle> */}
        <form onSubmit={handleSubmit}>
          <SectionField>
            <InputMultilocWithLocaleSwitcher
              type="text"
              valueMultiloc={{}}
              onChange={handleProjectHeaderOnChange}
              label={
                <LabelTooltip>
                  <FormattedMessage {...messages.firstPage} />
                  <IconTooltip
                    content={
                      <FormattedMessage {...messages.firstPageTooltip} />
                    }
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
                    content={
                      <FormattedMessage {...messages.secondPageTooltip} />
                    }
                  />
                </LabelTooltip>
              }
            />
          </SectionField>
          <SubmitWrapper
            loading={isFormSubmitting}
            status={getSubmitState({
              saved: isFormSaved,
              errors: null,
              diff: attributesDiff,
            })}
            messages={{
              buttonSave: messages.save,
              buttonSuccess: messages.saveSuccess,
              messageError: messages.saveErrorMessage,
              messageSuccess: messages.saveSuccessMessage,
            }}
          />
        </form>
      </SignUpFieldsSection>
      <Section>
        <SectionTitle>
          Fields
          {/* <FormattedMessage {...messages.signupFormText} /> */}
        </SectionTitle>
        <SectionDescription>
          <FormattedMessage {...messages.subtitleRegistration} />
        </SectionDescription>
        <AllCustomFields />
      </Section>
    </>
  );
};

export default SettingsRegistrationTab;
