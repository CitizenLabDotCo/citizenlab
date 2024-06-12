import React from 'react';

import {
  IconTooltip,
  Label,
  Button,
  Box,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import styled from 'styled-components';
import { object, array, string, number } from 'yup';

import { IAppConfigurationSettingsCore } from 'api/app_configuration/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { appLocalePairs } from 'containers/App/constants';

import {
  Section,
  SectionTitle,
  SubSectionTitle,
  SectionField,
  SectionDescription,
} from 'components/admin/Section';
import Feedback from 'components/HookForm/Feedback';
import Input from 'components/HookForm/Input';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import MultipleSelect from 'components/HookForm/MultipleSelect';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';

import messages from '../messages';

const StyledSection = styled(Section)`
  margin-bottom: 50px;
`;

interface FormValues {
  organization_name: IAppConfigurationSettingsCore['organization_name'];
  locales: IAppConfigurationSettingsCore['locales'];
  organization_site: IAppConfigurationSettingsCore['organization_site'];
  population: IAppConfigurationSettingsCore['population'];
}

export interface Props {
  defaultValues: FormValues;
  onSubmit: (formValues: FormValues) => Promise<void>;
}

const Form = ({ defaultValues, onSubmit }: Props) => {
  const multiLanguagePlatformEnabled = useFeatureFlag({
    name: 'multi_language_platform',
  });
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
    population: number()
      .integer()
      .nullable(true)
      .min(0, formatMessage(messages.populationMinError))
      .transform((value, originalValue) => {
        // Population should be allowed to be empty (null), but the input field
        // returns an empty string instead. This converts the empty string to
        // null.
        return originalValue === '' ? null : value;
      }),
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
              disabled={!multiLanguagePlatformEnabled}
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
          <SectionField>
            <Label htmlFor="population">
              <FormattedMessage {...messages.population} />
              <IconTooltip
                content={formatMessage(messages.populationTooltip)}
              />
            </Label>
            <Input
              id="population"
              type="number"
              required={false}
              name="population"
              placeholder="100000"
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
