import * as React from 'react';
import { Multiloc } from 'typings';
import styled from 'styled-components';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { fontSizes } from 'utils/styleUtils';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

// components
import { IconTooltip, Box, Button } from '@citizenlab/cl2-component-library';
import { Section, SectionField, SectionTitle } from 'components/admin/Section';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object, array } from 'yup';
import validateMultiloc from 'utils/yup/validateMultiloc';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import Input from 'components/HookForm/Input';
import Feedback from 'components/HookForm/Feedback';
import Select from 'components/HookForm/Select';
import MultipleSelect from 'components/HookForm/MultipleSelect';

// resources
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';

// hooks
import useLocalize from 'hooks/useLocalize';
import useAuthUser from 'hooks/useAuthUser';
import useAppConfiguration from 'hooks/useAppConfiguration';

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
} & InjectedIntlProps;

const CampaignForm = ({
  onSubmit,
  defaultValues,
  intl: { formatMessage },
}: CampaignFormProps) => {
  const user = useAuthUser();
  const appConfig = useAppConfiguration();
  const localize = useLocalize();

  const schema = object({
    sender: string()
      .oneOf(['author', 'organization'])
      .required(formatMessage(messages.fieldSenderError)),
    reply_to: string()
      .email(formatMessage(messages.fieldReplyToEmailError))
      .required(formatMessage(messages.fieldReplyToError)),
    subject_multiloc: validateMultiloc(
      formatMessage(messages.fieldSubjectError)
    ),
    body_multiloc: validateMultiloc(formatMessage(messages.fieldBodyError)),
    group_ids: array(),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  if (isNilOrError(user) || isNilOrError(appConfig)) {
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
        label: !isNilOrError(user)
          ? `${user.attributes.first_name} ${user.attributes.last_name}`
          : '',
      },
      {
        value: 'organization',
        label: !isNilOrError(appConfig)
          ? localize(appConfig.attributes.settings.core.organization_name)
          : '',
      },
    ];
  };

  const groupsOptions = (groups: GetGroupsChildProps) => {
    const groupList =
      !isNilOrError(groups) && !isNilOrError(groups.groupsList)
        ? groups.groupsList.map((group) => ({
            label: localize(group.attributes.title_multiloc),
            value: group.id,
          }))
        : [];

    return groupList;
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
                <>
                  <FormattedMessage {...messages.fieldSender} />
                  <IconTooltip
                    content={
                      <FormattedMessage {...messages.fieldSenderTooltip} />
                    }
                  />
                </>
              }
            />
          </StyledSectionField>

          <StyledSectionField>
            <GetGroups>
              {(groups) =>
                isNilOrError(groups) ? null : (
                  <MultipleSelect
                    name="group_ids"
                    placeholder={<FormattedMessage {...messages.allUsers} />}
                    options={groupsOptions(groups)}
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
                )
              }
            </GetGroups>
          </StyledSectionField>

          <StyledSectionField>
            <Input
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
              type="text"
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
              labelTooltipText={formatMessage(messages.nameVariablesInfo)}
              noVideos
              noAlign
            />
          </SectionField>
        </StyledSection>
        <Box display="flex">
          <Button type="submit" processing={methods.formState.isSubmitting}>
            {formatMessage(messages.formSave)}
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default injectIntl(CampaignForm);
