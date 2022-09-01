import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import streams from 'utils/streams';

// services
import { updateUser, mapUserToDiff } from 'services/users';
import GetLockedFields, {
  GetLockedFieldsChildProps,
} from 'resources/GetLockedFields';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';

// utils
import { Formik } from 'formik';

// components
import Error from 'components/UI/Error';
import PasswordInput, {
  hasPasswordMinimumLength,
} from 'components/UI/PasswordInput';
import PasswordInputIconTooltip from 'components/UI/PasswordInput/PasswordInputIconTooltip';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { SectionField } from 'components/admin/Section';
import {
  FormSection,
  FormLabel,
  FormSectionTitle,
} from 'components/UI/FormComponents';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object, mixed } from 'yup';
import validateMultiloc from 'utils/yup/validateMultiloc';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import Input from 'components/HookForm/Input';
import Select from 'components/HookForm/Select';
import FileUploader from 'components/HookForm/FileUploader';
import Feedback from 'components/HookForm/Feedback';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

import { IconTooltip, Box, Button } from '@citizenlab/cl2-component-library';
import QuillEditor from 'components/UI/QuillEditor';

// i18n
import { appLocalePairs, API_PATH } from 'containers/App/constants';
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import localize, { InjectedLocalized } from 'utils/localize';

// styling
import styled from 'styled-components';

// typings
import { IOption, UploadFile, CLErrorsJSON } from 'typings';

import Outlet from 'components/Outlet';
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';
import eventEmitter from 'utils/eventEmitter';

const StyledIconTooltip = styled(IconTooltip)`
  margin-left: 5px;
`;

const StyledPasswordInputIconTooltip = styled(PasswordInputIconTooltip)`
  margin-bottom: 4px;
`;

// Types
interface InputProps {}

interface DataProps {
  authUser: GetAuthUserChildProps;
  tenant: GetAppConfigurationChildProps;
  lockedFields: GetLockedFieldsChildProps;
  disableBio: GetFeatureFlagChildProps;
}

export type ExtraFormDataKey = 'custom_field_values';

type Props = InputProps & DataProps & InjectedIntlProps & InjectedLocalized;

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

  const [extraFormData, setExtraFormData] = useState({});

  const schema = object({
    first_name: string().required(),
    last_name: string().required(),
    email: string().email().required(),
    ...(!disableBio && {
      bio_multiloc: object(),
    }),
    language: string(),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues: {
      first_name: authUser?.attributes.first_name,
      last_name: authUser?.attributes.last_name,
      email: authUser?.attributes.email,
      bio_multiloc: authUser?.attributes.bio_multiloc,
      locale: authUser?.attributes.locale,
    },
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async (formValues) => {
    try {
      //    await onSubmit(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  // componentDidMount() {
  //   // Create options arrays only once, avoid re-calculating them on each render
  //   setLocaleOptions();

  //   transformAPIAvatar();
  // }

  // transformAPIAvatar = () => {
  //   const { authUser } = props;
  //   if (isNilOrError(authUser)) return;
  //   const avatarUrl =
  //     authUser.attributes.avatar && authUser.attributes.avatar.medium;
  //   if (avatarUrl) {
  //     convertUrlToUploadFile(avatarUrl, null, null).then((fileAvatar) => {
  //       setState({ avatar: fileAvatar ? [fileAvatar] : null });
  //     });
  //   }
  // };

  // componentDidUpdate(prevProps: Props) {
  //   const { tenantLocales, authUser } = props;

  //   // update locale options if tenant locales would change
  //   if (!isEqual(tenantLocales, prevProps.tenantLocales)) {
  //     setLocaleOptions();
  //   }

  //   if (
  //     authUser?.attributes.avatar?.medium !==
  //     prevProps.authUser?.attributes.avatar?.medium
  //   ) {
  //     transformAPIAvatar();
  //   }
  // }

  // const handleFormikSubmit = async (values, formikActions) => {
  //   const { setSubmitting, resetForm, setErrors, setStatus } = formikActions;
  //   const { authUser } = props;

  //   if (isNilOrError(authUser)) return;
  //   eventEmitter.emit('customFieldsSubmitEvent');

  //   const newValues = Object.entries(extraFormData).reduce(
  //     (acc, [key, extraFormDataConfiguration]) => ({
  //       ...acc,
  //       [key]: extraFormDataConfiguration?.formData,
  //     }),
  //     values
  //   );

  //   try {
  //     await updateUser(authUser.id, newValues);
  //     streams.fetchAllWith({
  //       apiEndpoint: [`${API_PATH}/onboarding_campaigns/current`],
  //     });
  //     resetForm();
  //     setStatus('success');
  //   } catch (errorResponse) {
  //     if (isCLErrorJSON(errorResponse)) {
  //       const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
  //       setErrors(apiErrors);
  //     } else {
  //       setStatus('error');
  //     }
  //     setSubmitting(false);
  //   }
  // };

  // const formikRender = (props) => {
  //   const {
  //     values,
  //     errors,
  //     setFieldValue,
  //     setFieldTouched,
  //     isSubmitting,
  //     submitForm,
  //   } = props;

  // const { hasPasswordMinimumLengthError } = state;

  // Won't be called with a nil or error user.
  if (isNilOrError(authUser)) return null;

  const lockedFieldsNames = isNilOrError(lockedFields)
    ? []
    : lockedFields.map((field) => field.attributes.name);

  // const handleFormOnChange = ({
  //   key,
  //   formData,
  // }: {
  //   key: ExtraFormDataKey;
  //   formData: Record<string, any>;
  // }) => {
  //   setExtraFormData({
  //     ...extraFormData,
  //     [key]: { ...(extraFormData?.[key] ?? {}), formData },
  //   });
  // };

  // const handleOnSubmit = () => {
  //   const { extraFormData } = state;
  //   Object.values(extraFormData).forEach((configuration) =>
  //     configuration?.submit?.()
  //   );
  //   submitForm();
  // };

  // const createChangeHandler = (fieldName: string) => (value) => {
  //   if (fieldName.endsWith('_multiloc')) {
  //     setFieldValue(fieldName, { [props.locale]: value });
  //   } else if (value && value.value) {
  //     setFieldValue(fieldName, value.value);
  //   } else {
  //     setFieldValue(fieldName, value);
  //   }
  // };

  // const handlePasswordOnChange = (password: string) => {
  //   const { tenant } = props;

  //   setState({
  //     hasPasswordMinimumLengthError: hasPasswordMinimumLength(
  //       password,
  //       !isNilOrError(tenant)
  //         ? tenant.attributes.settings.password_login?.minimum_length
  //         : undefined
  //     ),
  //   });
  //   setFieldValue('password', password);
  // };

  // const createBlurHandler = (fieldName: string) => () => {
  //   setFieldTouched(fieldName);
  // };

  // const handleAvatarOnAdd = (newAvatar: UploadFile[]) => {
  //   setState(() => ({ avatar: [newAvatar[0]] }));
  //   setFieldValue('avatar', newAvatar[0].base64);
  //   setFieldTouched('avatar');
  // };

  // const handleAvatarOnRemove = async () => {
  //   setState(() => ({ avatar: null }));
  //   setFieldValue('avatar', null);
  //   setFieldTouched('avatar');
  // };

  const handleFormOnChange = (values) => {
    console.log(values);
  };

  return (
    <FormSection>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onFormSubmit)}>
          <FormSectionTitle
            message={messages.h1}
            subtitleMessage={messages.h1sub}
          />
          <SectionField>
            <Feedback successMessage={'success'} />
          </SectionField>
          {/* <SectionField>
            <FormLabel
              htmlFor="profile-form-avatar-dropzone"
              labelMessage={messages.image}
            />
            <ImagesDropzone
              id="profile-form-avatar-dropzone"
              images={state.avatar}
              imagePreviewRatio={1}
              maxImagePreviewWidth="170px"
              acceptedFileTypes={{
                'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
              }}
              onAdd={handleAvatarOnAdd}
              onRemove={handleAvatarOnRemove}
              label={formatMessage(messages.imageDropzonePlaceholder)}
              removeIconAriaTitle={formatMessage(
                messages.a11y_imageDropzoneRemoveIconAriaTitle
              )}
              borderRadius="50%"
            />
            <Error apiErrors={errors.avatar} />
          </SectionField> */}

          <SectionField>
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
          </SectionField>

          <SectionField>
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
          </SectionField>

          <SectionField>
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
          </SectionField>

          {!disableBio && (
            <SectionField>
              <QuillMultilocWithLocaleSwitcher
                name="bio_multiloc"
                label={formatMessage(messages.bio)}
              />
            </SectionField>
          )}

          {/* <SectionField>
            <LabelContainer>
              <FormLabel
                width="max-content"
                margin-right="5px"
                labelMessage={messages.password}
                htmlFor="password"
              />
              <StyledPasswordInputIconTooltip />
            </LabelContainer>
            <PasswordInput
              id="password"
              password={values.password}
              onChange={handlePasswordOnChange}
              onBlur={createBlurHandler('password')}
              errors={{ minimumLengthError: hasPasswordMinimumLengthError }}
            />
          </SectionField> */}

          <SectionField>
            <Select
              name="locale"
              options={localeOptions}
              label={formatMessage(messages.language)}
            />
          </SectionField>
          <Outlet
            id="app.containers.UserEditPage.ProfileForm.forms"
            onChange={handleFormOnChange}
            authUser={authUser}
          />
          <Box display="flex">
            <Button type="submit" processing={methods.formState.isSubmitting}>
              save
            </Button>
          </Box>
        </form>
      </FormProvider>
    </FormSection>
  );
};

const ProfileFormWithHocs = injectIntl<InputProps>(localize(ProfileForm));

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
