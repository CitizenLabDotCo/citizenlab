import * as React from 'react';

import { Box, Button, fontSizes } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import styled from 'styled-components';
import { object } from 'yup';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';

import { Section, SectionField, SectionTitle } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
// import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';

import { CampaignFormValues, ICampaign } from 'api/campaigns/types';

const StyledSection = styled(Section)`
  margin-bottom: 2.5rem;
`;

const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom: 1rem;
  font-size: ${fontSizes.xl}px;
`;

export const PageTitle = styled.h1`
  width: 100%;
  font-size: 2rem;
  font-weight: 600;
  margin: 2rem 0 1rem;
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
  console.log('Default values:', defaultValues);

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  if (!authUser || !appConfig) {
    return null;
  }

  const editableRegions = campaign.data.attributes.editable_regions || [];
  console.log('Editable regions:', editableRegions);

  const onFormSubmit = async (formValues) => {
    // Convert the form values into a single value for the API
    console.log('Submitting form values:', formValues);
    const campaignFormValues = {
      custom_text_multiloc: switchKeys(formValues),
    };
    try {
      await onSubmit(campaignFormValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFormSubmit)}>
        <StyledSection>
          <StyledSectionTitle>Fields you can edit</StyledSectionTitle>

          {editableRegions.map((region) => (
            <>
              <SectionField className="e2e-campaign_subject_multiloc">
                <InputMultilocWithLocaleSwitcher
                  name={region.key}
                  label={region.key}
                  labelTooltipText={region.key}
                />
              </SectionField>
            </>
          ))}
        </StyledSection>
        <Box display="flex">
          <Button
            id="e2e-campaign-form-save-button"
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
