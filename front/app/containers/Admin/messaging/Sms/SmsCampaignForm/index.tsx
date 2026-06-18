import React from 'react';

import { Box, Button, IconTooltip } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import styled from 'styled-components';
import { Multiloc } from 'typings';
import { object, array } from 'yup';

import { IGroupData } from 'api/groups/types';
import useGroups from 'api/groups/useGroups';

import useLocalize from 'hooks/useLocalize';

import { Section, SectionField } from 'components/admin/Section';
import Feedback from 'components/HookForm/Feedback';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
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

export interface FormValues {
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
  group_ids?: string[];
}

type SmsCampaignFormProps = {
  onSubmit: (formValues: FormValues) => void | Promise<void>;
  defaultValues?: Partial<FormValues>;
  isLoading: boolean;
};

const SmsCampaignForm = ({
  onSubmit,
  defaultValues,
  isLoading,
}: SmsCampaignFormProps) => {
  const { formatMessage } = useIntl();
  const { data: groups } = useGroups({});
  const localize = useLocalize();

  const schema = object({
    title_multiloc: validateMultilocForEveryLocale(
      formatMessage(messages.fieldSmsTitleError)
    ),
    body_multiloc: validateMultilocForEveryLocale(
      formatMessage(messages.fieldSmsBodyError)
    ),
    group_ids: array().optional(),
  });

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues,
    // group_ids is optional, but yup still sees it as required, so we typecast.
    resolver: yupResolver(schema) as any,
  });

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const groupsOptions = (groups: IGroupData[]) =>
    groups.map((group) => ({
      label: localize(group.attributes.title_multiloc),
      value: group.id,
    }));

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFormSubmit)}>
        <StyledSection>
          <StyledSectionField>
            <Feedback onlyShowErrors={true} />
          </StyledSectionField>
          <StyledSectionField className="e2e-sms-campaign_title_multiloc">
            <InputMultilocWithLocaleSwitcher
              name="title_multiloc"
              label={<FormattedMessage {...messages.fieldSmsTitle} />}
              labelTooltipText={
                <FormattedMessage {...messages.fieldSmsTitleTooltip} />
              }
              maxCharCount={80}
            />
          </StyledSectionField>
          <StyledSectionField>
            <MultipleSelect
              name="group_ids"
              placeholder={<FormattedMessage {...messages.allUsers} />}
              options={groupsOptions(groups?.data || [])}
              label={
                <>
                  <FormattedMessage {...messages.fieldTo} />
                  <IconTooltip
                    content={<FormattedMessage {...messages.fieldToTooltip} />}
                  />
                </>
              }
            />
          </StyledSectionField>
          <SectionField className="e2e-sms-campaign_body_multiloc">
            <TextAreaMultilocWithLocaleSwitcher
              name="body_multiloc"
              label={formatMessage(messages.fieldSmsBody)}
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

export default SmsCampaignForm;
