import React from 'react';

import {
  Box,
  Button,
  fontSizes,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import styled from 'styled-components';
import { Multiloc } from 'typings';
import { object, array } from 'yup';

import { IGroupData } from 'api/groups/types';
import useGroups from 'api/groups/useGroups';

import useLocalize from 'hooks/useLocalize';

import { Section, SectionField, SectionTitle } from 'components/admin/Section';
import Feedback from 'components/HookForm/Feedback';
import MultipleSelect from 'components/HookForm/MultipleSelect';
import TextAreaMultilocWithLocaleSwitcher from 'components/HookForm/TextAreaMultilocWithLocaleSwitcher';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import validateMultilocForEveryLocale from 'utils/yup/validateMultilocForEveryLocale';

import messages from '../../messages';

const StyledSection = styled(Section)`
  margin-bottom: 2.5rem;
`;

const StyledSectionField = styled(SectionField)`
  margin-bottom: 10px;
`;

const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom: 1rem;
  font-size: ${fontSizes.xl}px;
`;

export interface FormValues {
  body_multiloc: Multiloc;
  group_ids?: string[];
}

type CampaignFormProps = {
  onSubmit: (formValues: FormValues) => void | Promise<void>;
  defaultValues?: Partial<FormValues>;
  isLoading: boolean;
};

const CampaignForm = ({
  onSubmit,
  defaultValues,
  isLoading,
}: CampaignFormProps) => {
  const { formatMessage } = useIntl();
  const { data: groups } = useGroups({});
  const localize = useLocalize();

  const schema = object({
    body_multiloc: validateMultilocForEveryLocale(
      formatMessage(messages.fieldSmsBodyError)
    ),
    group_ids: array().optional(),
  });

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema) as any,
  });

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const groupsOptions = (groupsData: IGroupData[]) => {
    return groupsData.map((group) => ({
      label: localize(group.attributes.title_multiloc),
      value: group.id,
    }));
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFormSubmit)}>
        <StyledSection>
          <StyledSectionField>
            <Feedback onlyShowErrors={true} />
          </StyledSectionField>
          <StyledSectionTitle>
            <FormattedMessage {...messages.senderRecipients} />
          </StyledSectionTitle>
          <StyledSectionField>
            <MultipleSelect
              name="group_ids"
              placeholder={<FormattedMessage {...messages.allUsers} />}
              options={groupsOptions(groups?.data || [])}
              label={
                <>
                  <FormattedMessage {...messages.fieldTo} />
                  <IconTooltip
                    content={
                      <FormattedMessage {...messages.smsRecipientsNote} />
                    }
                  />
                </>
              }
            />
          </StyledSectionField>
        </StyledSection>
        <StyledSection>
          <StyledSectionTitle>
            <FormattedMessage {...messages.fieldSmsBody} />
          </StyledSectionTitle>
          <SectionField className="e2e-sms_campaign_body_multiloc">
            <TextAreaMultilocWithLocaleSwitcher
              name="body_multiloc"
              label={formatMessage(messages.fieldSmsBody)}
              labelTooltipText={formatMessage(messages.fieldSmsBodyTooltip)}
              rows={5}
            />
          </SectionField>
        </StyledSection>
        <Box display="flex">
          <Button
            id="e2e-sms-campaign-form-save-button"
            type="submit"
            processing={isLoading}
          >
            {formatMessage(messages.formSaveAsDraft)}
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default CampaignForm;
