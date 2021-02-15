import * as React from 'react';
import { isEmpty, values as getValues, every } from 'lodash-es';
import { adopt } from 'react-adopt';
import { Multiloc } from 'typings';
import styled from 'styled-components';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../../messages';

// utils
import localize, { InjectedLocalized } from 'utils/localize';
import { isNilOrError } from 'utils/helperUtils';
import { fontSizes } from 'utils/styleUtils';

// components
import { IconTooltip, Label } from 'cl2-component-library';
import FormikMultipleSelect from 'components/UI/FormikMultipleSelect';
import FormikInput from 'components/UI/FormikInput';
import FormikQuillMultiloc from 'components/UI/QuillEditor/FormikQuillMultiloc';
import { Section, SectionField, SectionTitle } from 'components/admin/Section';
import {
  Form,
  Field,
  FastField,
  InjectedFormikProps,
  FormikErrors,
} from 'formik';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';
import FormikInputMultilocWithLocaleSwitcher from 'components/UI/FormikInputMultilocWithLocaleSwitcher';
import FormikSelect from 'components/UI/FormikSelect';
import Error from 'components/UI/Error';

// resources
import GetGroups, { GetGroupsChildProps } from 'resources/GetGroups';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';

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

interface InputProps {
  mode: 'new' | 'edit';
}

interface DataProps {
  user: GetAuthUserChildProps;
  tenant: GetAppConfigurationChildProps;
}

interface Props
  extends InputProps,
    DataProps,
    InjectedLocalized,
    InjectedIntlProps {}

export const validateCampaignForm = (
  values: FormValues
): FormikErrors<FormValues> => {
  const errors: FormikErrors<FormValues> = {};

  if (every(getValues(values.subject_multiloc), isEmpty)) {
    errors.subject_multiloc = [{ error: 'blank' }] as any;
  }

  return errors;
};

class CampaignForm extends React.Component<
  InjectedFormikProps<Props, FormValues>
> {
  senderOptions = () => {
    const { user, tenant, localize } = this.props;
    return [
      {
        value: 'author',
        label:
          !isNilOrError(user) &&
          `${user.attributes.first_name} ${user.attributes.last_name}`,
      },
      {
        value: 'organization',
        label:
          !isNilOrError(tenant) &&
          localize(tenant.attributes.settings.core.organization_name),
      },
    ];
  };

  groupsOptions = (groups: GetGroupsChildProps) => {
    const groupList =
      !isNilOrError(groups) && !isNilOrError(groups.groupsList)
        ? groups.groupsList.map((group) => ({
            label: this.props.localize(group.attributes.title_multiloc),
            value: group.id,
          }))
        : [];

    return groupList;
  };

  renderFormikQuillMultiloc = (props) => {
    return (
      <FormikQuillMultiloc
        label={this.props.intl.formatMessage(messages.fieldBody)}
        labelTooltipText={this.props.intl.formatMessage(
          messages.nameVariablesInfo
        )}
        noVideos
        noAlign
        {...props}
      />
    );
  };

  render() {
    const { isSubmitting, errors, isValid, touched, status } = this.props;
    return (
      <Form>
        <StyledSection>
          <StyledSectionTitle>
            <FormattedMessage {...messages.senderRecipients} />
          </StyledSectionTitle>
          <StyledSectionField>
            <Label>
              <FormattedMessage {...messages.fieldSender} />
              <IconTooltip
                content={<FormattedMessage {...messages.fieldSenderTooltip} />}
              />
            </Label>
            <FastField
              name="sender"
              component={FormikSelect}
              options={this.senderOptions()}
              clearable={false}
            />
            {touched.sender && (
              <Error fieldName="sender" apiErrors={errors.sender as any} />
            )}
          </StyledSectionField>

          <StyledSectionField>
            <Label>
              <FormattedMessage {...messages.fieldTo} />
              <IconTooltip
                content={<FormattedMessage {...messages.fieldToTooltip} />}
              />
            </Label>
            <GetGroups>
              {(groups) =>
                isNilOrError(groups) ? null : (
                  <Field
                    name="group_ids"
                    component={FormikMultipleSelect}
                    options={this.groupsOptions(groups)}
                    placeholder={<FormattedMessage {...messages.allUsers} />}
                  />
                )
              }
            </GetGroups>
            {touched.group_ids && (
              <Error
                fieldName="group_ids"
                apiErrors={errors.group_ids as any}
              />
            )}
          </StyledSectionField>

          <StyledSectionField>
            <Label>
              <FormattedMessage {...messages.fieldReplyTo} />
              <IconTooltip
                content={<FormattedMessage {...messages.fieldReplyToTooltip} />}
              />
            </Label>
            <FastField name="reply_to" component={FormikInput} type="email" />
            {touched.reply_to && (
              <Error fieldName="reply_to" apiErrors={errors.reply_to as any} />
            )}
          </StyledSectionField>
        </StyledSection>

        <StyledSection>
          <StyledSectionTitle>
            <FormattedMessage {...messages.fieldSubject} />
          </StyledSectionTitle>
          <SectionField>
            <FastField
              name="subject_multiloc"
              component={FormikInputMultilocWithLocaleSwitcher}
              label={<FormattedMessage {...messages.fieldSubject} />}
              labelTooltipText={
                <FormattedMessage {...messages.fieldSubjectTooltip} />
              }
              maxCharCount={80}
            />
            {touched.subject_multiloc && (
              <Error
                fieldName="subject_multiloc"
                apiErrors={errors.subject_multiloc as any}
              />
            )}
          </SectionField>

          <StyledSectionTitle>
            <FormattedMessage {...messages.fieldBody} />
          </StyledSectionTitle>
          <SectionField>
            <FastField
              name="body_multiloc"
              render={this.renderFormikQuillMultiloc}
            />
            {touched.body_multiloc && (
              <Error
                fieldName="body_multiloc"
                apiErrors={errors.body_multiloc as any}
              />
            )}
          </SectionField>
        </StyledSection>

        <FormikSubmitWrapper
          {...{ isValid, isSubmitting, status, touched, errors }}
          messages={{
            buttonSave: messages.formSaveButton,
            buttonError: messages.formErrorButton,
            buttonSuccess: messages.formSuccessButton,
            messageSuccess: messages.formSuccessMessage,
            messageError:
              Object.keys(errors).length > 0
                ? messages.formErrorMessage
                : messages.formUnexpectedErrorMessage,
          }}
        />
      </Form>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  user: ({ render }) => <GetAuthUser>{render}</GetAuthUser>,
  tenant: ({ render }) => <GetAppConfiguration>{render}</GetAppConfiguration>,
});

const CampaignFormWithHOCs = injectIntl(localize<InputProps>(CampaignForm));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <CampaignFormWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
