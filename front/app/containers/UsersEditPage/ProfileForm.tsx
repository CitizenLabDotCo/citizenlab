import React, { useState, useEffect } from 'react';

import { IconTooltip, Box, Button } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from 'lodash-es';
import { useForm, FormProvider } from 'react-hook-form';
import styled from 'styled-components';
import { IOption, UploadFile, Multiloc } from 'typings';
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
import { FormSection, FormSectionTitle } from 'components/UI/FormComponents';
import UserCustomFieldsForm from 'components/UserCustomFieldsForm';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { queryClient } from 'utils/cl-react-query/queryClient';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import eventEmitter from 'utils/eventEmitter';
import { convertUrlToUploadFile } from 'utils/fileUtils';

import messages from './messages';

const StyledIconTooltip = styled(IconTooltip)`
  margin-left: 5px;
  margin-top: 20px;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

type ExtraFormDataKey = 'custom_field_values';

type FormValues = {
  first_name?: string;
  last_name?: string;
  bio_multiloc?: Multiloc;
  locale?: string;
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
  const [extraFormData, setExtraFormData] = useState<{
    [field in ExtraFormDataKey]?: Record<string, any>;
  }>({});

  const schema = object({
    first_name: string().when('last_name', (last_name, schema) => {
      return last_name
        ? schema.required(formatMessage(messages.provideFirstNameIfLastName))
        : schema;
    }),
    last_name: string(),
    ...(!disableBio && {
      bio_multiloc: object(),
    }),
    locale: string(),
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
    resolver: yupResolver(schema),
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

  const handleDisclaimer = () => {
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
      await updateUser({ userId: authUser.data.id, ...newFormValues, avatar });
      queryClient.invalidateQueries({
        queryKey: onboardingCampaignsKeys.all(),
      });
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const lockedFieldsNames = !lockedAttributes
    ? []
    : lockedAttributes.data.map((field) => field.attributes.name);

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
          authenticationContext={GLOBAL_CONTEXT}
          onChange={handleCustomFieldsChange}
        />
        <Box display="flex">
          <Button
            type="submit"
            processing={methods.formState.isSubmitting}
            onClick={handleDisclaimer}
          >
            {formatMessage(messages.submit)}
          </Button>
        </Box>
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
