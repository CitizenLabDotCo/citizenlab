import * as React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import styled from 'styled-components';
import { object } from 'yup';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';

import { Section, SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
// import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';

import {
  CampaignFormValues,
  EditableRegion,
  ICampaign,
} from 'api/campaigns/types';
import useLocale from 'hooks/useLocale';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import messages from 'containers/Admin/messaging/messages';
import { FormattedMessage } from 'utils/cl-intl';

const StyledSection = styled(Section)`
  margin-bottom: 2.5rem;
`;

type CampaignFormProps = {
  onSubmit: (formValues: Partial<CampaignFormValues>) => void | Promise<void>;
  defaultValues?: Partial<CampaignFormValues>;
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
  const currentLocale = useLocale();
  // const schema = object({
  //   subject_multiloc: validateMultilocForEveryLocale(
  //     formatMessage(messages.fieldSubjectError)
  //   ),
  //   body_multiloc: validateMultilocForEveryLocale(
  //     formatMessage(messages.fieldBodyError)
  //   ),
  // });
  const schema = object({});

  // Helper function to convert single multiloc object to multiples object with locale keys and vice versa
  // TODO: Needs to be made more generic (ie locale agnostic)
  const switchKeys = (input) => {
    return Object.keys(input).reduce((acc, locale) => {
      Object.entries(input[locale]).forEach(([key, value]) => {
        acc[key] = acc[key] || {};
        acc[key][locale] = value;
      });
      return acc;
    }, {});
  };

  const defaultValues = switchKeys(
    campaign.data.attributes.custom_text_multiloc
  );

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const editableRegions = campaign.data.attributes.editable_regions || [];

  if (!authUser || !appConfig || editableRegions.length === 0) {
    return null;
  }

  const onFormSubmit = async (formValues) => {
    // Convert the form values into a single value for the API
    const campaignFormValues = {
      custom_text_multiloc: switchKeys(formValues),
    };
    try {
      await onSubmit(campaignFormValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const tooltipText = (region: EditableRegion) => (
    <>
      <p>
        <FormattedMessage {...messages.variablesToolTip} />
      </p>
      <ul>
        {region.variables.map((variable) => (
          <li>
            {'{{'}
            {variable}
            {'}}'}
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFormSubmit)}>
        <StyledSection>
          {editableRegions.map((region) => (
            <SectionField
              className={`e2e-automated-campaign-edit-region-${region.key}`}
              key={region.key}
            >
              {region.type === 'html' && (
                <QuillMultilocWithLocaleSwitcher
                  name={region.key}
                  label={region.title_multiloc[currentLocale]}
                  labelTooltipText={tooltipText(region)}
                  noVideos
                  noAlign
                />
              )}
              {region.type === 'text' && (
                <InputMultilocWithLocaleSwitcher
                  name={region.key}
                  label={region.title_multiloc[currentLocale]}
                  labelTooltipText={tooltipText(region)}
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
            Save
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default EditCampaignForm;
