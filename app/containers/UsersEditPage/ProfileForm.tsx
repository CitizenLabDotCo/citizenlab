import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import { isEqual, isEmpty } from 'lodash-es';
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
import { convertUrlToUploadFile } from 'utils/fileTools';
import { SectionField } from 'components/admin/Section';
import {
  FormSection,
  FormLabel,
  FormSectionTitle,
} from 'components/UI/FormComponents';

import { Input, Select, IconTooltip } from 'cl2-component-library';
import QuillEditor from 'components/UI/QuillEditor';

// i18n
import { appLocalePairs, API_PATH } from 'containers/App/constants';
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import localize, { InjectedLocalized } from 'utils/localize';

// styling
import SubmitWrapper from 'components/admin/SubmitWrapper';
import styled from 'styled-components';

// typings
import { IOption, UploadFile, CLErrorsJSON } from 'typings';
import { isCLErrorJSON } from 'utils/errorUtils';

import Outlet from 'components/Outlet';

const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
`;
const StyledIconTooltip = styled(IconTooltip)`
  margin-left: 5px;
`;

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledFormLabel = styled(FormLabel)`
  width: max-content;
  margin-right: 5px;
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
}

export type ExtraFormDataKey = 'custom_field_values';

export interface ExtraFormDataConfiguration {
  formData?: Object;
  submit?: () => void;
}

interface State {
  avatar: UploadFile[] | null;
  extraFormData: {
    [field in ExtraFormDataKey]?: ExtraFormDataConfiguration;
  };
  hasPasswordMinimumLengthError: boolean;
}

type Props = InputProps & DataProps & InjectedIntlProps & InjectedLocalized;

class ProfileForm extends PureComponent<Props, State> {
  localeOptions: IOption[] = [];

  constructor(props: InputProps) {
    super(props as any);
    this.state = {
      avatar: null,
      extraFormData: {},
      hasPasswordMinimumLengthError: false,
    };
  }

  componentDidMount() {
    // Create options arrays only once, avoid re-calculating them on each render
    this.setLocaleOptions();

    this.transformAPIAvatar();
  }

  setLocaleOptions = () => {
    this.localeOptions = this.props.tenantLocales.map((locale) => ({
      value: locale,
      label: appLocalePairs[locale],
    }));
  };

  transformAPIAvatar = () => {
    const { authUser } = this.props;
    if (isNilOrError(authUser)) return;
    const avatarUrl =
      authUser.attributes.avatar && authUser.attributes.avatar.medium;
    if (avatarUrl) {
      convertUrlToUploadFile(avatarUrl, null, null).then((fileAvatar) => {
        this.setState({ avatar: fileAvatar ? [fileAvatar] : null });
      });
    }
  };

  componentDidUpdate(prevProps: Props) {
    const { tenantLocales, authUser } = this.props;

    // update locale options if tenant locales would change
    if (!isEqual(tenantLocales, prevProps.tenantLocales)) {
      this.setLocaleOptions();
    }

    if (
      authUser?.attributes.avatar?.medium !==
      prevProps.authUser?.attributes.avatar?.medium
    ) {
      this.transformAPIAvatar();
    }
  }

  handleFormikSubmit = async (values, formikActions) => {
    const { setSubmitting, resetForm, setErrors, setStatus } = formikActions;
    const { authUser } = this.props;

    if (isNilOrError(authUser)) return;

    const newValues = Object.entries(this.state.extraFormData).reduce(
      (acc, [key, extraFormDataConfiguration]) => ({
        ...acc,
        [key]: extraFormDataConfiguration?.formData,
      }),
      values
    );

    setStatus('');

    try {
      await updateUser(authUser.id, newValues);
      streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/onboarding_campaigns/current`],
      });
      resetForm();
      setStatus('success');
    } catch (errorResponse) {
      if (isCLErrorJSON(errorResponse)) {
        const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
        setErrors(apiErrors);
      } else {
        setStatus('error');
      }
      setSubmitting(false);
    }
  };

  formikRender = (props) => {
    const {
      values,
      errors,
      setFieldValue,
      setFieldTouched,
      setStatus,
      isSubmitting,
      submitForm,
      isValid,
      status,
      touched,
    } = props;
    const { lockedFields, authUser } = this.props;
    const { hasPasswordMinimumLengthError } = this.state;

    // Won't be called with a nil or error user.
    if (isNilOrError(authUser)) return null;

    const lockedFieldsNames = isNilOrError(lockedFields)
      ? []
      : lockedFields.map((field) => field.attributes.name);

    const { formatMessage } = this.props.intl;

    const getStatus = () => {
      let returnValue: 'enabled' | 'disabled' | 'error' | 'success' = 'enabled';

      if (isSubmitting) {
        returnValue = 'disabled';
      } else if ((!isEmpty(touched) && !isValid) || status === 'error') {
        returnValue = 'error';
      } else if (isEmpty(touched) && status === 'success') {
        returnValue = 'success';
      }

      return returnValue;
    };

    const handleFormOnChange = () => setStatus('enabled');

    const handleFormOnSubmit = ({
      key,
      formData,
    }: {
      key: ExtraFormDataKey;
      formData: Object;
    }) => {
      this.setState(({ extraFormData }) => ({
        extraFormData: {
          ...extraFormData,
          [key]: { ...(extraFormData?.[key] ?? {}), formData },
        },
      }));
      submitForm();
    };

    const handleOnSubmit = () => {
      const { extraFormData } = this.state;
      Object.values(extraFormData).forEach((configuration) =>
        configuration?.submit?.()
      );
      submitForm();
    };

    const handleOutletData = ({
      key,
      data,
    }: {
      key: ExtraFormDataKey;
      data: ExtraFormDataConfiguration;
    }) => {
      this.setState(({ extraFormData }) => ({
        extraFormData: { ...extraFormData, [key]: data },
      }));
    };

    const createChangeHandler = (fieldName: string) => (value) => {
      if (fieldName.endsWith('_multiloc')) {
        setFieldValue(fieldName, { [this.props.locale]: value });
      } else if (value && value.value) {
        setFieldValue(fieldName, value.value);
      } else {
        setFieldValue(fieldName, value);
      }
    };

    const handlePasswordOnChange = (password: string) => {
      const { tenant } = this.props;

      this.setState({
        hasPasswordMinimumLengthError: hasPasswordMinimumLength(
          password,
          !isNilOrError(tenant)
            ? tenant.attributes.settings.password_login?.minimum_length
            : undefined
        ),
      });
      setFieldValue('password', password);
    };

    const createBlurHandler = (fieldName: string) => () => {
      setFieldTouched(fieldName);
    };

    const handleAvatarOnAdd = (newAvatar: UploadFile[]) => {
      this.setState(() => ({ avatar: [newAvatar[0]] }));
      setFieldValue('avatar', newAvatar[0].base64);
      setFieldTouched('avatar');
    };

    const handleAvatarOnRemove = async () => {
      this.setState(() => ({ avatar: null }));
      setFieldValue('avatar', null);
      setFieldTouched('avatar');
    };

    return (
      <FormSection>
        <form className="e2e-profile-edit-form">
          <FormSectionTitle
            message={messages.h1}
            subtitleMessage={messages.h1sub}
          />

          <SectionField>
            <ImagesDropzone
              id="profile-form-avatar-dropzone"
              images={this.state.avatar}
              imagePreviewRatio={1}
              maxImagePreviewWidth="170px"
              acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
              maxImageFileSize={5000000}
              maxNumberOfImages={1}
              onAdd={handleAvatarOnAdd}
              onRemove={handleAvatarOnRemove}
              label={formatMessage(messages.imageDropzonePlaceholder)}
              removeIconAriaTitle={formatMessage(
                messages.a11y_imageDropzoneRemoveIconAriaTitle
              )}
              borderRadius="50%"
            />
            <Error apiErrors={errors.avatar} />
          </SectionField>

          <SectionField>
            <FormLabel htmlFor="firstName" labelMessage={messages.firstNames} />
            <InputContainer>
              <Input
                type="text"
                name="first_name"
                id="firstName"
                value={values.first_name}
                onChange={createChangeHandler('first_name')}
                onBlur={createBlurHandler('first_name')}
                disabled={lockedFieldsNames.includes('first_name')}
              />
              {lockedFieldsNames.includes('first_name') && (
                <StyledIconTooltip
                  content={<FormattedMessage {...messages.blockedVerified} />}
                  icon="lock"
                />
              )}
            </InputContainer>
            <Error apiErrors={errors.first_name} />
          </SectionField>

          <SectionField>
            <FormLabel htmlFor="lastName" labelMessage={messages.lastName} />
            <InputContainer id="e2e-last-name-input">
              <Input
                type="text"
                name="last_name"
                id="lastName"
                value={values.last_name}
                onChange={createChangeHandler('last_name')}
                onBlur={createBlurHandler('last_name')}
                disabled={lockedFieldsNames.includes('last_name')}
              />
              {lockedFieldsNames.includes('last_name') && (
                <StyledIconTooltip
                  content={<FormattedMessage {...messages.blockedVerified} />}
                  icon="lock"
                />
              )}
            </InputContainer>
            <Error apiErrors={errors.last_name} />
          </SectionField>

          <SectionField>
            <FormLabel htmlFor="email" labelMessage={messages.email} />
            <InputContainer>
              <Input
                type="email"
                name="email"
                id="email"
                value={values.email}
                onChange={createChangeHandler('email')}
                onBlur={createBlurHandler('email')}
                disabled={lockedFieldsNames.includes('email')}
              />
              {lockedFieldsNames.includes('email') && (
                <StyledIconTooltip
                  content={<FormattedMessage {...messages.blockedVerified} />}
                  icon="lock"
                  className="e2e-last-name-lock"
                />
              )}
            </InputContainer>
            <Error apiErrors={errors.email} />
          </SectionField>

          <SectionField>
            <FormLabel labelMessage={messages.bio} id="label-bio" />
            <QuillEditor
              id="bio_multiloc"
              noImages={true}
              noVideos={true}
              limitedTextFormatting={true}
              value={
                values.bio_multiloc
                  ? this.props.localize(values.bio_multiloc)
                  : ''
              }
              placeholder={formatMessage({ ...messages.bio_placeholder })}
              onChange={createChangeHandler('bio_multiloc')}
              onBlur={createBlurHandler('bio_multiloc')}
            />
            <Error apiErrors={errors.bio_multiloc} />
          </SectionField>

          <SectionField>
            <LabelContainer>
              <StyledFormLabel
                labelMessage={messages.password}
                htmlFor="profile-password-input"
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
          </SectionField>

          <SectionField>
            <FormLabel htmlFor="language" labelMessage={messages.language} />
            <Select
              id="language"
              onChange={createChangeHandler('locale')}
              onBlur={createBlurHandler('locale')}
              value={values.locale}
              options={this.localeOptions}
            />
            <Error apiErrors={errors.locale} />
          </SectionField>
        </form>

        <Outlet
          id="app.containers.UserEditPage.ProfileForm.forms"
          authUser={authUser}
          onChange={handleFormOnChange}
          onSubmit={handleFormOnSubmit}
          onData={handleOutletData}
        />

        <SubmitWrapper
          status={getStatus()}
          buttonStyle="primary"
          loading={isSubmitting}
          onClick={handleOnSubmit}
          messages={{
            buttonSave: messages.submit,
            buttonSuccess: messages.buttonSuccessLabel,
            messageSuccess: messages.messageSuccess,
            messageError: messages.messageError,
          }}
        />
      </FormSection>
    );
  };

  render() {
    const { authUser } = this.props;

    if (!isNilOrError(authUser)) {
      return (
        <Formik
          initialValues={mapUserToDiff(authUser)}
          onSubmit={this.handleFormikSubmit}
          render={this.formikRender as any}
        />
      );
    }

    return null;
  }
}

const ProfileFormWithHocs = injectIntl<InputProps>(localize(ProfileForm));

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  tenant: <GetAppConfiguration />,
  lockedFields: <GetLockedFields />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ProfileFormWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
