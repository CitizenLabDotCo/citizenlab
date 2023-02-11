import React from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import { object } from 'yup';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { appLocalePairs } from 'containers/App/constants';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';

// components
import {
  IconTooltip,
  Label,
  Button,
  Box,
} from '@citizenlab/cl2-component-library';
import {
  Section,
  SectionTitle,
  SubSectionTitle,
  SectionField,
  SectionDescription,
} from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import Input from 'components/HookForm/Input';
import MultipleSelect from 'components/HookForm/MultipleSelect';
import Feedback from 'components/HookForm/Feedback';

// services
import { IAppConfigurationSettingsCore } from 'services/appConfiguration';

// Utils
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';
import useAppConfiguration from 'hooks/useAppConfiguration';

const StyledSection = styled(Section)`
  margin-bottom: 50px;
`;

interface FormValues {
  organization_name: IAppConfigurationSettingsCore['organization_name'];
  locales: IAppConfigurationSettingsCore['locales'];
  organization_site: IAppConfigurationSettingsCore['organization_site'];
}

interface Props {
  defaultValues: FormValues;
  onSubmit: (formValues: FormValues) => Promise<void>;
}

const Form = ({ defaultValues, onSubmit }: Props) => {
  const { formatMessage } = useIntl();
  const appConfig = useAppConfiguration();
  const schema = object({
    organization_name: validateMultilocForEveryLocale(
      formatMessage(messages.organizationNameMultilocError)
    ),
  });
  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  // May need memoization
  const getLocaleOptions = () => {
    return Object.entries(appLocalePairs).map(([label, locale]) => ({
      label,
      value: locale,
    }));
  };

  if (!isNilOrError(appConfig)) {
    const organizationType =
      appConfig.attributes.settings.core.organization_type;

    return (
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onFormSubmit)}>
          <Feedback />
          <SectionTitle>
            <FormattedMessage {...messages.titleBasic} />
          </SectionTitle>
          <StyledSection>
            <SubSectionTitle>
              <FormattedMessage {...messages.platformConfiguration} />
            </SubSectionTitle>
            <SectionDescription>
              <FormattedMessage {...messages.subtitleBasic} />
            </SectionDescription>

            <SectionField>
              <InputMultilocWithLocaleSwitcher
                type="text"
                id="organization_name"
                name="organization_name"
                label={
                  <FormattedMessage
                    {...messages.organizationName}
                    values={{ type: organizationType }}
                  />
                }
              />
            </SectionField>

            <SectionField>
              <Label>
                <FormattedMessage {...messages.languages} />
                <IconTooltip
                  content={<FormattedMessage {...messages.languagesTooltip} />}
                />
              </Label>
              <MultipleSelect
                name="locales"
                placeholder=""
                options={getLocaleOptions()}
              />
            </SectionField>

            <SectionField>
              <Label>
                <FormattedMessage {...messages.urlTitle} />
                <IconTooltip
                  content={formatMessage(messages.urlTitleTooltip)}
                />
              </Label>
              <Input
                type="text"
                name="organization_url"
                placeholder="https://..."
              />
            </SectionField>
            <Box display="flex">
              <Button type="submit" processing={methods.formState.isSubmitting}>
                {formatMessage(messages.save)}
              </Button>
            </Box>
          </StyledSection>
        </form>
      </FormProvider>
    );
  }

  return null;
};

export default Form;
