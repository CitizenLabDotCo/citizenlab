import * as React from 'react';

import {
  IconTooltip,
  Box,
  Button,
  fontSizes,
  Label,
  Text,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import styled from 'styled-components';
import { Multiloc } from 'typings';
import { string, object, array } from 'yup';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IGroupData } from 'api/groups/types';
import useGroups from 'api/groups/useGroups';
import useAuthUser from 'api/me/useAuthUser';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import { Section, SectionField, SectionTitle } from 'components/admin/Section';
import Feedback from 'components/HookForm/Feedback';
import Input from 'components/HookForm/Input';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import MultipleSelect from 'components/HookForm/MultipleSelect';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import Select from 'components/HookForm/Select';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { getFullName } from 'utils/textUtils';
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

export const PageTitle = styled.h1`
  width: 100%;
  font-size: 2rem;
  font-weight: 600;
  margin: 2rem 0 1rem;
`;

export interface FormValues {
  sender: 'author' | 'organization';
  reply_to: string;
  subject_multiloc: Multiloc;
  body_multiloc: Multiloc;
  group_ids?: string[];
}

type CampaignFormProps = {
  onSubmit: (formValues: FormValues) => void | Promise<void>;
  defaultValues?: Partial<FormValues>;
  isLoading: boolean;
  campaignContextId?: string;
};

const CampaignForm = ({
  onSubmit,
  defaultValues,
  isLoading,
  campaignContextId,
}: CampaignFormProps) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const { data: groups } = useGroups({});
  const { data: appConfig } = useAppConfiguration();
  const { data: project } = useProjectById(campaignContextId);
  const localize = useLocalize();
  const schema = object({
    sender: string()
      .oneOf(['author', 'organization'])
      .required(formatMessage(messages.fieldSenderError)),
    reply_to: string()
      .email(formatMessage(messages.fieldReplyToEmailError))
      .required(formatMessage(messages.fieldReplyToError)),
    subject_multiloc: validateMultilocForEveryLocale(
      formatMessage(messages.fieldSubjectError)
    ),
    body_multiloc: validateMultilocForEveryLocale(
      formatMessage(messages.fieldBodyError)
    ),
    group_ids: array(),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  if (!authUser || !appConfig) {
    return null;
  }

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const senderOptions = () => {
    return [
      {
        value: 'author',
        label: getFullName(authUser.data),
      },
      {
        value: 'organization',
        label: localize(
          appConfig.data.attributes.settings.core.organization_name
        ),
      },
    ];
  };

  const groupsOptions = (groups: IGroupData[]) => {
    return groups.map((group) => ({
      label: localize(group.attributes.title_multiloc),
      value: group.id,
    }));
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFormSubmit)}>
        <StyledSection>
          <StyledSectionField>
            <Feedback />
          </StyledSectionField>
          <StyledSectionTitle>
            <FormattedMessage {...messages.senderRecipients} />
          </StyledSectionTitle>
          <StyledSectionField>
            <Select
              name="sender"
              options={senderOptions()}
              label={
                <Box display="flex">
                  <FormattedMessage {...messages.fieldSender} />
                  <IconTooltip
                    content={
                      <FormattedMessage {...messages.fieldSenderTooltip} />
                    }
                  />
                </Box>
              }
            />
          </StyledSectionField>

          {campaignContextId && project && (
            <>
              <Label>
                <FormattedMessage {...messages.fieldTo} />
              </Label>
              <Text fontSize="l">
                <FormattedMessage {...messages.allParticipantsInProject} />{' '}
                <Link to={`/admin/projects/${project.data.id}`} target="_blank">
                  {localize(project.data.attributes.title_multiloc)}
                </Link>
              </Text>
            </>
          )}

          {!campaignContextId && (
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
                        <FormattedMessage {...messages.fieldToTooltip} />
                      }
                    />
                  </>
                }
              />
            </StyledSectionField>
          )}

          <StyledSectionField>
            <Input
              id="e2e-reply-to-input"
              name="reply_to"
              type="email"
              label={formatMessage(messages.fieldReplyTo)}
              labelTooltipText={formatMessage(messages.fieldReplyToTooltip)}
            />
          </StyledSectionField>
        </StyledSection>
        <StyledSection>
          <StyledSectionTitle>
            <FormattedMessage {...messages.fieldSubject} />
          </StyledSectionTitle>
          <SectionField className="e2e-campaign_subject_multiloc">
            <InputMultilocWithLocaleSwitcher
              name="subject_multiloc"
              label={<FormattedMessage {...messages.fieldSubject} />}
              labelTooltipText={
                <FormattedMessage {...messages.fieldSubjectTooltip} />
              }
              maxCharCount={80}
            />
          </SectionField>
          <StyledSectionTitle>
            <FormattedMessage {...messages.fieldBody} />
          </StyledSectionTitle>
          <SectionField className="e2e-campaign_body_multiloc">
            <QuillMultilocWithLocaleSwitcher
              name="body_multiloc"
              label={formatMessage(messages.fieldBody)}
              labelTooltipText={formatMessage(messages.nameVariablesInfo, {
                firstName: '{{first_name}}',
                lastName: '{{last_name}}',
              })}
              noVideos
              noAlign
            />
          </SectionField>
        </StyledSection>
        <Box display="flex">
          <Button
            id="e2e-campaign-form-save-button"
            type="submit"
            processing={isLoading}
          >
            {formatMessage(messages.formSave)}
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default CampaignForm;
