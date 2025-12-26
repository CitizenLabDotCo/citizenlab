import * as React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import styled from 'styled-components';
import { object, string } from 'yup';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import {
  CampaignFormValues,
  EditableRegion,
  ICampaign,
} from 'api/campaigns/types';
import useAuthUser from 'api/me/useAuthUser';

import messages from 'containers/Admin/messaging/messages';

import { Section, SectionField } from 'components/admin/Section';
import Input from 'components/HookForm/Input';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';

const StyledSection = styled(Section)`
  margin-bottom: 2.5rem;
`;

type CampaignFormProps = {
  onSubmit: (formValues: Partial<CampaignFormValues>) => void | Promise<void>;
  campaign: ICampaign;
  isLoading: boolean;
};

const EditCampaignForm = ({
  onSubmit,
  campaign,
  isLoading,
}: CampaignFormProps) => {
  const { data: authUser } = useAuthUser();
  const { data: appConfig } = useAppConfiguration();
  const { formatMessage } = useIntl();

  // Schema and default values are derived from which editable regions are present
  const editableRegions = campaign.data.attributes.editable_regions || [];
  const editableRegionVariableKeys =
    campaign.data.attributes.substitution_variable_keys || [];

  const schema = object({
    ...editableRegions.reduce((fieldSchema, region) => {
      if (!region.allow_blank_locales) {
        fieldSchema[region.key] = validateMultilocForEveryLocale(
          formatMessage(messages.regionMultilocError)
        );
      }
      return fieldSchema;
    }, {}),
    ...{
      reply_to: string()
        .email(formatMessage(messages.fieldReplyToEmailError))
        .nullable(),
    },
  });

  const defaultValues = {
    ...editableRegions.reduce((fieldValue, region) => {
      fieldValue[region.key] = campaign.data.attributes[region.key];
      return fieldValue;
    }, {}),
    ...{ reply_to: campaign.data.attributes.reply_to },
  };

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  if (!authUser || !appConfig || editableRegions.length === 0) {
    return null;
  }

  const onFormSubmit = async (formValues) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const variablesTooltipText =
    editableRegionVariableKeys.length === 0 ? null : (
      <>
        <p>
          <FormattedMessage {...messages.variablesToolTip} />
        </p>
        <ul>
          {editableRegionVariableKeys.map((variable) => (
            <li key={variable}>
              {'{{'}
              {variable}
              {'}}'}
            </li>
          ))}
        </ul>
      </>
    );

  const regionFieldLabel = (region: EditableRegion) => {
    const messageKey = messages[`editRegion_${region.key}`];
    return formatMessage(messageKey);
  };

  const defaultReplyTo = appConfig.data.attributes.settings.core.reply_to_email;
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFormSubmit)}>
        <h2>
          <FormattedMessage {...messages.editButtonLabel} />
        </h2>
        <StyledSection>
          <SectionField>
            <Input
              id="e2e-reply-to-input"
              name="reply_to"
              type="email"
              placeholder={defaultReplyTo}
              label={formatMessage(messages.fieldReplyTo)}
              labelTooltipText={formatMessage(messages.fieldReplyToTooltip)}
            />
          </SectionField>

          {editableRegions.map((region) => (
            <SectionField
              className={`e2e-automated-campaign-edit-region-${region.key}`}
              key={region.key}
            >
              {region.type === 'html' && (
                <QuillMultilocWithLocaleSwitcher
                  name={region.key}
                  label={regionFieldLabel(region)}
                  labelTooltipText={variablesTooltipText}
                  noVideos
                  noAlign
                />
              )}
              {region.type === 'text' && (
                <InputMultilocWithLocaleSwitcher
                  name={region.key}
                  label={regionFieldLabel(region)}
                  labelTooltipText={variablesTooltipText}
                />
              )}
            </SectionField>
          ))}
        </StyledSection>
        <Box display="flex" mb="24px">
          <Button
            id="e2e-automated-campaign-edit-save-button"
            type="submit"
            processing={isLoading}
          >
            <FormattedMessage {...messages.formSave} />
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default EditCampaignForm;
