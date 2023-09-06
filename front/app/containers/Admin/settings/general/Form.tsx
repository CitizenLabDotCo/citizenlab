import React from 'react';
import styled from 'styled-components';
import { object, array, string } from 'yup';
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
import { IAppConfigurationSettingsCore } from 'api/app_configuration/types';

// Utils
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';

const StyledSection = styled(Section)`
  margin-bottom: 50px;
`;

interface FormValues {
  organization_name: IAppConfigurationSettingsCore['organization_name'];
  locales: IAppConfigurationSettingsCore['locales'];
  organization_site: IAppConfigurationSettingsCore['organization_site'];
}

export interface Props {
  defaultValues: FormValues;
  onSubmit: (formValues: FormValues) => Promise<void>;
}

const Form = ({ defaultValues, onSubmit }: Props) => {
  const { formatMessage } = useIntl();
  const schema = object({
    organization_name: validateMultilocForEveryLocale(
      formatMessage(messages.organizationNameMultilocError)
    ),
    locales: array().min(1, formatMessage(messages.atLeastOneLocale)),
    // Taken from settings.schema.json.erb
    organization_site: string().matches(
      /^$|^((http:\/\/.+)|(https:\/\/.+))/,
      formatMessage(messages.urlPatternError)
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
  const localeOptions = Object.entries(appLocalePairs).map(
    ([locale, label]) => {
      return {
        label,
        value: locale,
      };
    }
  );

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
              id="organization_name"
              name="organization_name"
              label={<FormattedMessage {...messages.organizationName} />}
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
              options={localeOptions}
            />
          </SectionField>

          <SectionField>
            <Label htmlFor="organization_site">
              <FormattedMessage {...messages.urlTitle} />
              <IconTooltip content={formatMessage(messages.urlTitleTooltip)} />
            </Label>
            <Input
              id="organization_site"
              type="text"
              name="organization_site"
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
};

export default Form;
