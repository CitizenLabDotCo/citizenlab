import React, { useState, useEffect, FormEvent } from 'react';

import {
  IconTooltip,
  Box,
  Text,
  Button,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from 'lodash-es';
import { useForm, FormProvider } from 'react-hook-form';
import styled from 'styled-components';
import { IOption, UploadFile, Multiloc, SupportedLocale } from 'typings';
import { string, object, mixed } from 'yup';

import { GLOBAL_CONTEXT } from 'api/authentication/authentication_requirements/constants';
import useAuthUser from 'api/me/useAuthUser';
import onboardingCampaignsKeys from 'api/onboarding_campaigns/keys';
import useUserLockedAttributes from 'api/user_locked_attributes/useUserLockedAttributes';
import useUpdateUser from 'api/users/useUpdateUser';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useFeatureFlag from 'hooks/useFeatureFlag';

import { appLocalePairs } from 'containers/App/constants';

import { SectionField } from 'components/admin/Section';
import ContentUploadDisclaimer from 'components/ContentUploadDisclaimer';
import Feedback from 'components/HookForm/Feedback';
import ImagesDropzone from 'components/HookForm/ImagesDropzone';
import Input from 'components/HookForm/Input';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import Select from 'components/HookForm/Select';
import commentsMessages from 'components/PostShowComponents/Comments/messages';
import Error from 'components/UI/Error';
import { FormSection, FormSectionTitle } from 'components/UI/FormComponents';
import UserCustomFieldsForm from 'components/UserCustomFields';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { queryClient } from 'utils/cl-react-query/queryClient';
import Link from 'utils/cl-router/Link';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import validateLocale from 'utils/yup/validateLocale';

import messages from './messages';

const StyledIconTooltip = styled(IconTooltip)`
  margin-left: 5px;
  margin-top: 20px;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

type FormValues = {
  first_name?: string;
  last_name?: string;
  bio_multiloc?: Multiloc;
  locale: SupportedLocale;
  avatar?: UploadFile[] | null;
};

const ProfileForm = () => {
  const tenantLocales = useAppConfigurationLocales();
  const disableBio = useFeatureFlag({ name: 'disable_user_bios' });
  const userAvatarsEnabled = useFeatureFlag({ name: 'user_avatars' });
  const [isDisclaimerOpened, setIsDisclaimerOpened] = useState(false);
  const { mutateAsync: updateUser } = useUpdateUser();
  const { data: authUser } = useAuthUser();
  const { data: lockedAttributes } = useUserLockedAttributes();
  const { formatMessage } = useIntl();
  const [extraFormData, setExtraFormData] = useState<Record<string, any>>({});
  const [profanityApiError, setProfanityApiError] = useState(false);
  const [triggerCustomFieldsValidation, setTriggerCustomFieldsValidation] =
    useState(false);
  const [validationInProgress, setValidationInProgress] = useState(false);

  const schema = object({
    first_name: string().when('last_name', ([last_name], schema) => {
      return last_name
        ? schema.required(formatMessage(messages.provideFirstNameIfLastName))
        : schema;
    }),
    last_name: string(),
    ...(!disableBio && {
      bio_multiloc: object(),
    }),
    locale: validateLocale(),
    ...(userAvatarsEnabled ? { avatar: mixed().nullable() } : {}),
  });

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {
      first_name: authUser?.data.attributes.no_name
        ? undefined
        : authUser?.data.attributes.first_name ?? undefined,
      last_name: authUser?.data.attributes.no_name
        ? undefined
        : authUser?.data.attributes.last_name || undefined,
      bio_multiloc: authUser?.data.attributes.bio_multiloc,
      locale: authUser?.data.attributes.locale,
    },
    resolver: yupResolver(schema) as any,
  });

  useEffect(() => {
    if (!userAvatarsEnabled) return;

    const avatarUrl = authUser?.data.attributes.avatar?.medium;

    if (avatarUrl) {
      convertUrlToUploadFile(avatarUrl, null, null).then((fileAvatar) => {
        if (fileAvatar) {
          methods.setValue('avatar', [fileAvatar]);
        }
      });
    } else {
      methods.setValue('avatar', null);
    }
  }, [authUser, methods, userAvatarsEnabled]);

  if (!authUser || !tenantLocales) return null;

  const localeOptions: IOption[] = tenantLocales.map((locale) => ({
    value: locale,
    label: appLocalePairs[locale],
  }));

  const handleDisclaimer = async (event: FormEvent) => {
    // Prevent page from reloading
    event.preventDefault();

    // First validate the main form
    const isMainFormValid = await methods.trigger();
    if (!isMainFormValid) {
      return;
    }

    // Trigger custom fields validation and wait for result
    setValidationInProgress(true);
    setTriggerCustomFieldsValidation(true);
  };

  // Handle custom fields validation result
  const handleCustomFieldsValidation = (isValid: boolean) => {
    setTriggerCustomFieldsValidation(false);
    setValidationInProgress(false);

    if (!isValid) {
      return; // Stop submission if custom fields are invalid
    }

    // Proceed with submission logic if both forms are valid
    if (
      methods.formState.dirtyFields.avatar &&
      methods.getValues('avatar') &&
      isEmpty(methods.formState.errors)
    ) {
      setIsDisclaimerOpened(true);
    } else {
      methods.handleSubmit(onFormSubmit)();
    }
  };

  const onAcceptDisclaimer = () => {
    methods.handleSubmit(onFormSubmit)();
    setIsDisclaimerOpened(false);
  };

  const onCancelDisclaimer = () => {
    setIsDisclaimerOpened(false);
  };

  const onFormSubmit = async (formValues: FormValues) => {
    const avatar = formValues.avatar ? formValues.avatar[0].base64 : null;

    // Add custom fields values to form
    const newFormValues = {
      custom_field_values: extraFormData,
      ...formValues,
    };

    try {
      await updateUser({ userId: authUser.data.id, ...newFormValues, avatar });
      queryClient.invalidateQueries({
        queryKey: onboardingCampaignsKeys.all(),
      });
      setProfanityApiError(false);
    } catch (error) {
      const profanityApiError = Array.isArray(error?.errors?.base)
        ? error.errors.base.find(
            (apiError) => apiError.error === 'includes_banned_words'
          )
        : null;
      if (profanityApiError) {
        setProfanityApiError(true);
      }

      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const lockedFieldsNames = !lockedAttributes
    ? []
    : lockedAttributes.data.map((field) => field.attributes.name);

  return (
    <FormSection>
      <FormProvider {...methods}>
        <form onSubmit={handleDisclaimer}>
          <FormSectionTitle
            message={messages.h1}
            subtitleMessage={messages.h1sub}
          />
          <SectionField>
            <Feedback successMessage={formatMessage(messages.messageSuccess)} />
            {profanityApiError && (
              <Error
                text={
                  <FormattedMessage
                    {...commentsMessages.profanityError}
                    values={{
                      guidelinesLink: (
                        <Link to="/pages/faq" target="_blank">
                          {formatMessage(commentsMessages.guidelinesLinkText)}
                        </Link>
                      ),
                    }}
                  />
                }
              />
            )}
          </SectionField>

          {userAvatarsEnabled && (
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
          )}

          {/* TODO: Fix this the next time the file is edited. */}
          {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
          {authUser?.data.attributes.no_name && (
            <Text>
              <FormattedMessage
                {...messages.noNameWarning}
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                values={{ displayName: authUser?.data.attributes.display_name }}
              />
            </Text>
          )}
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
          <UserCustomFieldsForm
            authenticationContext={GLOBAL_CONTEXT}
            onChange={setExtraFormData}
            formData={authUser.data.attributes.custom_field_values}
            triggerValidation={triggerCustomFieldsValidation}
            onValidationResult={handleCustomFieldsValidation}
          />
          <Box display="flex">
            <Button
              processing={
                methods.formState.isSubmitting || validationInProgress
              }
            >
              {formatMessage(messages.submit)}
            </Button>
          </Box>
        </form>
      </FormProvider>
      <ContentUploadDisclaimer
        isDisclaimerOpened={isDisclaimerOpened}
        onAcceptDisclaimer={onAcceptDisclaimer}
        onCancelDisclaimer={onCancelDisclaimer}
      />
    </FormSection>
  );
};

export default ProfileForm;
