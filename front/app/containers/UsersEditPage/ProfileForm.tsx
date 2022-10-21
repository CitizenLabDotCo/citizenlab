import React, { useEffect, useState } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import streams from 'utils/streams';

// services
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetLockedFields, {
  GetLockedFieldsChildProps,
} from 'resources/GetLockedFields';
import { updateUser } from 'services/users';

import { convertUrlToUploadFile } from 'utils/fileUtils';

// components
import { Box, Button, IconTooltip } from '@citizenlab/cl2-component-library';
import { SectionField } from 'components/admin/Section';
import {
  FormLabel,
  FormSection,
  FormSectionTitle,
} from 'components/UI/FormComponents';
import PasswordInputIconTooltip from 'components/UI/PasswordInput/PasswordInputIconTooltip';

// form
import { yupResolver } from '@hookform/resolvers/yup';
import Feedback from 'components/HookForm/Feedback';
import ImagesDropzone from 'components/HookForm/ImagesDropzone';
import Input from 'components/HookForm/Input';
import PasswordInput from 'components/HookForm/PasswordInput';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import Select from 'components/HookForm/Select';
import { FormProvider, useForm } from 'react-hook-form';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { mixed, object, string } from 'yup';

// i18n
import { API_PATH, appLocalePairs } from 'containers/App/constants';
import { WrappedComponentProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import localize, { InjectedLocalized } from 'utils/localize';
import messages from './messages';

// styling
import styled from 'styled-components';

// typings
import { IOption, Multiloc, UploadFile } from 'typings';

import Outlet from 'components/Outlet';
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';
import eventEmitter from 'utils/eventEmitter';

const StyledIconTooltip = styled(IconTooltip)`
  margin-left: 5px;
  margin-top: 20px;
`;

const StyledPasswordInputIconTooltip = styled(PasswordInputIconTooltip)`
  margin-bottom: 4px;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

interface InputProps {}

interface DataProps {
  authUser: GetAuthUserChildProps;
  tenant: GetAppConfigurationChildProps;
  lockedFields: GetLockedFieldsChildProps;
  disableBio: GetFeatureFlagChildProps;
}

export type ExtraFormDataKey = 'custom_field_values';

type Props = InputProps & DataProps & WrappedComponentProps & InjectedLocalized;

type FormValues = {
  first_name?: string;
  last_name?: string;
  email?: string;
  bio_multiloc?: Multiloc;
  locale?: string;
  avatar?: UploadFile[] | null;
};

const ProfileForm = ({
  intl: { formatMessage },
  disableBio,
  tenant,
  tenantLocales,
  lockedFields,
  authUser,
}: Props) => {
  const localeOptions: IOption[] = tenantLocales.map((locale) => ({
    value: locale,
    label: appLocalePairs[locale],
  }));

  const [extraFormData, setExtraFormData] = useState<{
    [field in ExtraFormDataKey]?: Record<string, any>;
  }>({});

  const minimumPasswordLength =
    (!isNilOrError(tenant) &&
      tenant.attributes.settings.password_login?.minimum_length) ||
    0;

  const schema = object({
    first_name: string().required(formatMessage(messages.firstNamesEmptyError)),
    last_name: string().required(formatMessage(messages.lastNameEmptyError)),
    email: string()
      .email(formatMessage(messages.emailInvalidError))
      .required(formatMessage(messages.emailEmptyError)),
    ...(!disableBio && {
      bio_multiloc: object(),
    }),
    password: string().test(
      'length',
      'Value can be empty or contain a string at with least the minimum password length',
      (value, { createError, path }) => {
        if (value && value.length > 0 && value.length < minimumPasswordLength) {
          return createError({
            path,
            message: formatMessage(messages.minimumPasswordLengthError, {
              minimumPasswordLength,
            }),
          });
        } else return true;
      }
    ),
    locale: string(),
    avatar: mixed().nullable(),
  });

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {
      first_name: authUser?.attributes.first_name,
      last_name: authUser?.attributes.last_name || undefined,
      email: authUser?.attributes.email,
      bio_multiloc: authUser?.attributes.bio_multiloc,
      locale: authUser?.attributes.locale,
    },
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (isNilOrError(authUser)) return;
    const avatarUrl =
      authUser.attributes.avatar && authUser.attributes.avatar.medium;
    if (avatarUrl) {
      convertUrlToUploadFile(avatarUrl, null, null).then((fileAvatar) => {
        if (fileAvatar) {
          methods.setValue('avatar', [fileAvatar]);
        }
      });
    } else {
      methods.setValue('avatar', null);
    }
  }, [authUser, methods]);

  if (isNilOrError(authUser)) return null;

  const onFormSubmit = async (formValues: FormValues) => {
    const avatar = formValues.avatar ? formValues.avatar[0].base64 : null;
    // Add custom fields values to form
    const newFormValues = Object.entries(extraFormData).reduce(
      (acc, [key, extraFormDataConfiguration]) => {
        return {
          ...acc,
          [key]: extraFormDataConfiguration?.formData,
        };
      },
      formValues
    );

    eventEmitter.emit('customFieldsSubmitEvent');
    Object.values(extraFormData).forEach((configuration) => {
      configuration?.submit?.();
    });

    try {
      await updateUser(authUser.id, { ...newFormValues, avatar });
      streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/onboarding_campaigns/current`],
      });
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const lockedFieldsNames = isNilOrError(lockedFields)
    ? []
    : lockedFields.map((field) => field.attributes.name);

  const handleCustomFieldsChange = ({
    key,
    formData,
  }: {
    key: ExtraFormDataKey;
    formData: Record<string, any>;
  }) => {
    setExtraFormData({
      ...extraFormData,
      [key]: { ...(extraFormData?.[key] ?? {}), formData },
    });
  };

  return (
    <FormSection>
      <FormProvider {...methods}>
        <form>
          <FormSectionTitle
            message={messages.h1}
            subtitleMessage={messages.h1sub}
          />
          <SectionField>
            <Feedback successMessage={formatMessage(messages.messageSuccess)} />
          </SectionField>
          <SectionField>
            <ImagesDropzone
              name="avatar"
              imagePreviewRatio={1}
              maxImagePreviewWidth="170px"
              acceptedFileTypes={{
                'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
              }}
              label={formatMessage(messages.imageDropzonePlaceholder)}
              inputLabel={formatMessage(messages.image)}
              removeIconAriaTitle={formatMessage(
                messages.a11y_imageDropzoneRemoveIconAriaTitle
              )}
              borderRadius="50%"
            />
          </SectionField>

          <SectionField>
            <InputContainer>
              <Input
                type="text"
                name="first_name"
                label={formatMessage(messages.firstNames)}
                autocomplete="given-name"
                disabled={lockedFieldsNames.includes('first_name')}
              />
              {lockedFieldsNames.includes('first_name') && (
                <StyledIconTooltip
                  content={<FormattedMessage {...messages.blockedVerified} />}
                  icon="lock"
                />
              )}
            </InputContainer>
          </SectionField>

          <SectionField>
            <InputContainer>
              <Input
                type="text"
                name="last_name"
                label={formatMessage(messages.lastName)}
                autocomplete="family-name"
                disabled={lockedFieldsNames.includes('last_name')}
              />
              {lockedFieldsNames.includes('last_name') && (
                <StyledIconTooltip
                  content={<FormattedMessage {...messages.blockedVerified} />}
                  icon="lock"
                />
              )}
            </InputContainer>
          </SectionField>

          <SectionField>
            <InputContainer>
              <Input
                type="email"
                name="email"
                label={formatMessage(messages.email)}
                autocomplete="email"
                disabled={lockedFieldsNames.includes('email')}
              />
              {lockedFieldsNames.includes('email') && (
                <StyledIconTooltip
                  content={<FormattedMessage {...messages.blockedVerified} />}
                  icon="lock"
                />
              )}
            </InputContainer>
          </SectionField>

          {!disableBio && (
            <SectionField>
              <QuillMultilocWithLocaleSwitcher
                name="bio_multiloc"
                noImages
                noVideos
                limitedTextFormatting
                label={formatMessage(messages.bio)}
              />
            </SectionField>
          )}

          <SectionField>
            <Box display="flex" alignItems="center">
              <FormLabel
                width="max-content"
                margin-right="5px"
                labelMessage={messages.password}
                htmlFor="password"
              />
              <StyledPasswordInputIconTooltip />
            </Box>
            <PasswordInput name="password" />
          </SectionField>

          <SectionField>
            <Select
              name="locale"
              options={localeOptions}
              label={formatMessage(messages.language)}
            />
          </SectionField>
        </form>
        <Outlet
          id="app.containers.UserEditPage.ProfileForm.forms"
          onChange={handleCustomFieldsChange}
          authUser={authUser}
        />
        <Box display="flex">
          <Button
            type="submit"
            processing={methods.formState.isSubmitting}
            onClick={methods.handleSubmit(onFormSubmit)}
          >
            {formatMessage(messages.submit)}
          </Button>
        </Box>
      </FormProvider>
    </FormSection>
  );
};

const ProfileFormWithHocs = injectIntl(localize(ProfileForm));

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  tenant: <GetAppConfiguration />,
  lockedFields: <GetLockedFields />,
  disableBio: <GetFeatureFlag name="disable_user_bios" />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ProfileFormWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
