import React, { Suspense, lazy, useState } from 'react';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// typings
import { Multiloc, UploadFile } from 'typings';

// form
import { FormProvider, useForm } from 'react-hook-form';
import { SectionField } from 'components/admin/Section';
import Feedback from 'components/HookForm/Feedback';
import TopicsPicker from 'components/HookForm/TopicsPicker';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, array, mixed, string, boolean } from 'yup';
import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';
import {
  FormSection,
  FormSectionTitle,
  FormLabel,
} from 'components/UI/FormComponents';

// intl
import messages from '../messages';
import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';

// Components
import SubmitButtonBar from './SubmitButtonBar';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
const ProfileVisibilityFormSection = lazy(
  () => import('./ProfileVisibilityFormSection')
);
const CosponsorsFormSection = lazy(() => import('./CosponsorsFormSection'));
const AnonymousParticipationConfirmationModal = lazy(
  () => import('components/AnonymousParticipationConfirmationModal')
);
import FileUploader from 'components/HookForm/FileUploader';
import ImagesDropzone from 'components/HookForm/ImagesDropzone';
import LocationInput from 'components/HookForm/LocationInput';

// Hooks
import useInitiativeReviewRequired from 'hooks/useInitiativeReviewRequired';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useTopics from 'api/topics/useTopics';
import useLocale from 'hooks/useLocale';

const StyledFormSection = styled(FormSection)`
  ${media.phone`
    padding-left: 18px;
    padding-right: 18px;
  `}
`;

export interface FormValues {
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
  topic_ids?: string[];
  position?: string;
  cosponsor_ids?: string[];
  local_initiative_files?: UploadFile[];
  // The uploaded image is stored in an array, even though we can only store 1
  images?: UploadFile[] | null;
  header_bg?: UploadFile[] | null;
  anonymous?: boolean;
}

export type InitiativeFormProps = {
  onSubmit: (formValues: FormValues) => void | Promise<void>;
  defaultValues?: FormValues;
};

const mapsLoaded = window.googleMaps;

const InitiativeForm = ({ onSubmit, defaultValues }: InitiativeFormProps) => {
  const [postAnonymously, setPostAnonymously] = useState(false);
  const [showAnonymousConfirmationModal, setShowAnonymousConfirmationModal] =
    useState(false);
  const initiativeReviewRequired = useInitiativeReviewRequired();
  const { data: appConfiguration } = useAppConfiguration();
  const requiredNumberOfCosponsors =
    appConfiguration?.data.attributes.settings.initiatives?.cosponsors_number;

  const { formatMessage } = useIntl();
  const locale = useLocale();
  const { data: topics } = useTopics({ excludeCode: 'custom' });
  const schema = object({
    title_multiloc: validateAtLeastOneLocale(
      formatMessage(messages.titleEmptyError)
    ),
    body_multiloc: validateAtLeastOneLocale(
      formatMessage(messages.descriptionEmptyError)
    ),
    position: string().optional().nullable(),
    topic_ids: array().optional(),
    ...(initiativeReviewRequired &&
      typeof requiredNumberOfCosponsors === 'number' && {
        cosponsor_ids: array().min(
          requiredNumberOfCosponsors,
          formatMessage(messages.minRequiredCosponsors, {
            requiredNumberOfCosponsors,
          })
        ),
      }),
    local_initiative_files: mixed().optional(),
    images: mixed().optional().nullable(),
    header_bg: mixed().optional().nullable(),
    anonymous: boolean().optional(),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(schema),
  });

  if (isNilOrError(locale) || !topics) return null;

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const onChangeProfileVisibility = () => {
    setPostAnonymously((postAnonymously) => !postAnonymously);
  };

  const handleOnCloseModal = () => {
    setShowAnonymousConfirmationModal(false);
  };

  return (
    <>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onFormSubmit)}
          data-testid="initiativeForm"
        >
          <Box pb="92px">
            <Feedback />
            <StyledFormSection>
              <FormSectionTitle message={messages.formGeneralSectionTitle} />

              <SectionField id="e2e-initiative-form-title-section">
                <FormLabel
                  htmlFor="e2e-initiative-title-input"
                  labelMessage={messages.titleLabel}
                  subtextMessage={messages.titleLabelSubtext2}
                >
                  <InputMultilocWithLocaleSwitcher
                    name="title_multiloc"
                    id="e2e-initiative-title-input"
                    autocomplete="off"
                    maxCharCount={72}
                  />
                  {/* {touched.title_multiloc && errors.title_multiloc ? (
                <Error
                  id="e2e-proposal-title-error"
                  text={formatMessage(errors.title_multiloc.message)}
                />
              ) : (
                apiErrors &&
                apiErrors.title_multiloc && (
                  <Error apiErrors={apiErrors.title_multiloc} />
                )
              )} */}
                </FormLabel>
                {/* {titleProfanityError && (
              <Error
                text={
                  <FormattedMessage
                    {...messages.profanityError}
                    values={{
                      guidelinesLink: (
                        <Link to="/pages/faq" target="_blank">
                          {formatMessage(messages.guidelinesLinkText)}
                        </Link>
                      ),
                    }}
                  />
                }
              />
            )} */}
              </SectionField>

              <SectionField id="e2e-initiative-form-description-section">
                <FormLabel
                  id="description-label-id"
                  htmlFor="body_multiloc"
                  labelMessage={messages.descriptionLabel}
                  subtextMessage={messages.descriptionLabelSubtext}
                />
                <QuillMultilocWithLocaleSwitcher
                  name="body_multiloc"
                  noVideos
                  noAlign
                />
                {/* {touched.body_multiloc && errors.body_multiloc ? (
              <Error text={formatMessage(errors.body_multiloc.message)} />
            ) : (
              apiErrors &&
              apiErrors.body_multiloc && (
                <Error apiErrors={apiErrors.body_multiloc} />
              )
            )}
            {descriptionProfanityError && (
              <Error
                text={
                  <FormattedMessage
                    {...messages.profanityError}
                    values={{
                      guidelinesLink: (
                        <Link to="/pages/faq" target="_blank">
                          {formatMessage(messages.guidelinesLinkText)}
                        </Link>
                      ),
                    }}
                  />
                }
              />
            )} */}
              </SectionField>
            </StyledFormSection>
            <StyledFormSection>
              <FormSectionTitle message={messages.formDetailsSectionTitle} />
              <SectionField aria-live="polite">
                <FormLabel
                  labelMessage={messages.topicsLabel}
                  subtextMessage={messages.topicsLabelDescription}
                />
                <TopicsPicker name="topic_ids" availableTopics={topics.data} />
                {/* {touched.topic_ids && errors.topic_ids ? (
              <Error text={formatMessage(errors.topic_ids.message)} />
            ) : (
              apiErrors &&
              apiErrors.topic_ids && <Error apiErrors={apiErrors.topic_ids} />
            )} */}
              </SectionField>
              {mapsLoaded && (
                <SectionField>
                  <FormLabel
                    labelMessage={messages.locationLabel}
                    subtextMessage={messages.locationLabelSubtext}
                    htmlFor="position"
                    optional
                  >
                    <LocationInput
                      name="position"
                      className="e2e-initiative-location-input"
                      placeholder={formatMessage(messages.locationPlaceholder)}
                    />
                  </FormLabel>
                </SectionField>
              )}
            </StyledFormSection>
            <Suspense fallback={null}>
              <CosponsorsFormSection />
            </Suspense>
            <StyledFormSection>
              <FormSectionTitle
                message={messages.formAttachmentsSectionTitle}
              />
              <SectionField id="e2e-iniatiative-banner-dropzone">
                <FormLabel
                  labelMessage={messages.bannerUploadLabel}
                  subtextMessage={messages.bannerUploadLabelSubtext}
                  htmlFor="header_bg"
                  optional
                />
                <ImagesDropzone
                  name="header_bg"
                  imagePreviewRatio={360 / 1440}
                  acceptedFileTypes={{
                    'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
                  }}
                />
                {/* {apiErrors && apiErrors.header_bg && (
            <Error apiErrors={apiErrors.header_bg} />
          )} */}
              </SectionField>
              <SectionField id="e2e-iniatiative-img-dropzone">
                <FormLabel
                  labelMessage={messages.imageUploadLabel}
                  subtextMessage={messages.imageUploadLabelSubtext}
                  htmlFor="images"
                  optional
                />
                <ImagesDropzone
                  name="images"
                  imagePreviewRatio={135 / 298}
                  acceptedFileTypes={{
                    'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
                  }}
                />
              </SectionField>
              <SectionField>
                <FormLabel
                  labelMessage={messages.fileUploadLabel}
                  subtextMessage={messages.fileUploadLabelSubtext}
                  htmlFor="e2e-initiative-file-upload"
                  optional
                >
                  <FileUploader
                    name="local_initiative_files"
                    data-cy="e2e-initiative-file-upload"
                    // apiErrors={apiErrors}
                  />
                </FormLabel>
              </SectionField>
            </StyledFormSection>
            <Suspense fallback={null}>
              <ProfileVisibilityFormSection
                onChange={onChangeProfileVisibility}
                postAnonymously={postAnonymously}
              />
            </Suspense>
          </Box>
          <SubmitButtonBar processing={methods.formState.isSubmitting} />
        </form>
      </FormProvider>
      <Suspense fallback={null}>
        {showAnonymousConfirmationModal && (
          <AnonymousParticipationConfirmationModal
            onConfirmAnonymousParticipation={() => {}}
            onCloseModal={handleOnCloseModal}
          />
        )}
      </Suspense>
    </>
  );
};

export default InitiativeForm;
