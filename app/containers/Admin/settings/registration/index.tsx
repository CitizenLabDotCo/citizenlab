import React, { useState } from 'react';
import styled from 'styled-components';
import getSubmitState from 'utils/getSubmitState';
import { isCLErrorJSON } from 'utils/errorUtils';
import { CLError, Multiloc } from 'typings';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';

import {
  IUpdatedAppConfigurationProperties,
  updateAppConfiguration,
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

const SettingsRegistrationTab = (_props: Props) => {
  const appConfig = useAppConfiguration();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [isFormSaved, setIsFormSaved] = useState(false);
  const [errors, setErrors] = useState<{ [fieldName: string]: CLError[] }>({});
  const [attributesDiff, setAttributesDiff] = useState<
    IUpdatedAppConfigurationProperties
  >({});

  const handlePageOnChange = (propertyName: string) => (multiloc: Multiloc) => {
    setAttributesDiff({
      ...attributesDiff,
      settings: {
        ...(attributesDiff.settings || {}),
        core: {
          ...(attributesDiff.settings?.core || {}),
          [propertyName]: multiloc,
        },
      },
    });
  };

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
        setErrors(isCLErrorJSON(error) ? error.json.errors : error);
      }
    }
  };

  if (!isNilOrError(appConfig)) {
    const latestAppConfigCoreSettings = {
      ...appConfig.data.attributes,
      ...attributesDiff,
    }.settings.core;

    return (
      <>
        <SignUpFieldsSection key={'signup_fields'}>
          <SectionTitle>
            <FormattedMessage {...messages.signupFormText} />
          </SectionTitle>
          <SectionDescription>
            <FormattedMessage {...messages.signupFormTooltip} />
          </SectionDescription>
          <form onSubmit={handleSubmit}>
            <SectionField>
              <InputMultilocWithLocaleSwitcher
                type="text"
                valueMultiloc={
                  latestAppConfigCoreSettings?.signup_helper_text || null
                }
                onChange={handlePageOnChange('signup_helper_text')}
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
                valueMultiloc={
                  latestAppConfigCoreSettings?.custom_fields_signup_helper_text ||
                  null
                }
                onChange={handlePageOnChange(
                  'custom_fields_signup_helper_text'
                )}
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
                errors,
                saved: isFormSaved,
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
            <FormattedMessage {...messages.fields} />
          </SectionTitle>
          <SectionDescription>
            <FormattedMessage {...messages.subtitleRegistration} />
          </SectionDescription>
          <AllCustomFields />
        </Section>
      </>
    );
  }

  return null;
};

export default SettingsRegistrationTab;
