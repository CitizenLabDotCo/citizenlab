import React, { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import streams from 'utils/streams';

// services
import { updateUser } from 'services/users';
import GetLockedFields, {
  GetLockedFieldsChildProps,
} from 'resources/GetLockedFields';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import { convertUrlToUploadFile } from 'utils/fileUtils';

// components
import { IconTooltip, Box, Button } from '@citizenlab/cl2-component-library';
import { SectionField } from 'components/admin/Section';
import { FormSection, FormSectionTitle } from 'components/UI/FormComponents';
import UserCustomFieldsForm from 'components/UserCustomFieldsForm';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object, mixed } from 'yup';
import ImagesDropzone from 'components/HookForm/ImagesDropzone';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import Input from 'components/HookForm/Input';
import Select from 'components/HookForm/Select';
import Feedback from 'components/HookForm/Feedback';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

// i18n
import { appLocalePairs, API_PATH } from 'containers/App/constants';
import messages from './messages';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import localize, { InjectedLocalized } from 'utils/localize';

// styling
import styled from 'styled-components';

// constants
import { GLOBAL_CONTEXT } from 'api/authentication/authentication_requirements/constants';

// typings
import { IOption, UploadFile, Multiloc } from 'typings';

import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';
import eventEmitter from 'utils/eventEmitter';

const StyledIconTooltip = styled(IconTooltip)`
  margin-left: 5px;
  margin-top: 20px;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

interface InputProps {}

interface DataProps {
  authUser: GetAuthUserChildProps;
  lockedFields: GetLockedFieldsChildProps;
  disableBio: GetFeatureFlagChildProps;
}

export type ExtraFormDataKey = 'custom_field_values';

type Props = InputProps & DataProps & WrappedComponentProps & InjectedLocalized;

type FormValues = {
  first_name?: string;
  last_name?: string;
  bio_multiloc?: Multiloc;
  locale?: string;
  avatar?: UploadFile[] | null;
};

const ProfileForm = ({
  intl: { formatMessage },
  disableBio,
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

  const schema = object({
    first_name: string(),
    last_name: string(),
    ...(!disableBio && {
      bio_multiloc: object(),
    }),
    locale: string(),
    avatar: mixed().nullable(),
  });

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {
      first_name: authUser?.attributes.no_name
        ? undefined
        : authUser?.attributes.first_name ?? undefined,
      last_name: authUser?.attributes.no_name
        ? undefined
        : authUser?.attributes.last_name || undefined,
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
            <Select
              name="locale"
              options={localeOptions}
              label={formatMessage(messages.language)}
            />
          </SectionField>
        </form>
        <UserCustomFieldsForm
          authUser={authUser}
          authenticationContext={GLOBAL_CONTEXT}
          onChange={handleCustomFieldsChange}
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
  lockedFields: <GetLockedFields />,
  disableBio: <GetFeatureFlag name="disable_user_bios" />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ProfileFormWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
