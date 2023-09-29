import React, { Suspense, lazy, useEffect, useState } from 'react';
import { convertUrlToUploadFile } from 'utils/fileUtils';

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
import messages from './messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

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
import LocationInput from 'components/HookForm/LocationInput';
import { Box } from '@citizenlab/cl2-component-library';
const ImageAndAttachmentsSection = lazy(
  () => import('./ImagesAndAttachmentsSection')
);
import Warning from 'components/UI/Warning';

// Hooks
import useTopics from 'api/topics/useTopics';
import { IInitiativeData } from 'api/initiatives/types';
import { IInitiativeImageData } from 'api/initiative_images/types';
import { IInitiativeFileData } from 'api/initiative_files/types';
import useInitiativeReviewRequired from 'containers/InitiativesShow/hooks/useInitiativeReviewRequired';
import { stripHtmlTags } from 'utils/helperUtils';
import useInitiativeCosponsorsRequired from 'containers/InitiativesShow/hooks/useInitiativeCosponsorsRequired';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

declare module 'components/UI/Error' {
  interface TFieldNameMap {
    position: 'position';
  }
}

export interface FormValues {
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
  topic_ids?: string[];
  position?: string;
  cosponsor_ids?: string[];
  local_initiative_files: UploadFile[];
  // The uploaded image is stored in an array, even though we can only store 1
  images: UploadFile[] | null;
  header_bg: UploadFile[] | null;
  anonymous: boolean;
}

export type Props = {
  onSubmit: (formValues: FormValues) => Promise<void>;
  initiative?: IInitiativeData;
  initiativeImage?: IInitiativeImageData;
  initiativeFiles?: IInitiativeFileData[];
};

const MAX_NUMBER_OF_COSPONSORS = 10;

const InitiativeForm = ({
  onSubmit,
  initiative,
  initiativeImage,
  initiativeFiles,
}: Props) => {
  const mapsLoaded = window.googleMaps;
  const { formatMessage } = useIntl();
  const [showAnonymousConfirmationModal, setShowAnonymousConfirmationModal] =
    useState(false);
  const cosponsorsRequired = useInitiativeCosponsorsRequired();
  const initiativeReviewRequired = useInitiativeReviewRequired();
  const { data: appConfiguration } = useAppConfiguration();
  const { data: topics } = useTopics({ excludeCode: 'custom' });
  const schema = object({
    title_multiloc: validateAtLeastOneLocale(
      formatMessage(messages.titleEmptyError),
      {
        validateEachLocale: (schema) =>
          schema.test({
            message: formatMessage(messages.titleMinLengthError),
            test: (value) => !value || value.length >= 10,
          }),
      }
    ),
    body_multiloc: validateAtLeastOneLocale(
      formatMessage(messages.descriptionEmptyError),
      {
        validateEachLocale: (schema) =>
          schema.test({
            message: formatMessage(messages.descriptionBodyLengthError),
            test: (value) => !value || stripHtmlTags(value).length >= 30,
          }),
      }
    ),
    position: string().optional().nullable(),
    topic_ids: array()
      .required(formatMessage(messages.topicEmptyError))
      .min(1, formatMessage(messages.topicEmptyError)),
    ...(cosponsorsRequired &&
      typeof appConfiguration?.data.attributes.settings.initiatives
        .cosponsors_number === 'number' && {
        cosponsor_ids: array()
          .required(formatMessage(messages.cosponsorsEmptyError))
          .min(
            appConfiguration.data.attributes.settings.initiatives
              .cosponsors_number,
            formatMessage(messages.cosponsorsEmptyError)
          )
          .max(
            MAX_NUMBER_OF_COSPONSORS,
            formatMessage(messages.cosponsorsMaxError, {
              maxNumberOfCosponsors: MAX_NUMBER_OF_COSPONSORS,
            })
          ),
      }),
    local_initiative_files: mixed().optional(),
    images: mixed().optional().nullable(),
    header_bg: mixed().optional().nullable(),
    anonymous: boolean().optional(),
  });

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: initiative
      ? {
          title_multiloc: initiative.attributes.title_multiloc,
          body_multiloc: initiative.attributes.body_multiloc,
          position: initiative.attributes.location_description,
          topic_ids: initiative.relationships.topics.data.map(
            (topic) => topic.id
          ),
          cosponsor_ids: initiative.attributes.cosponsorships
            ? initiative.attributes.cosponsorships.map(
                (cosponsor) => cosponsor.user_id
              )
            : [],
          anonymous: initiative.attributes.anonymous,
        }
      : undefined,
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const imageUrl = initiativeImage?.attributes.versions.large;

    if (imageUrl) {
      const id = initiativeImage.id;
      convertUrlToUploadFile(imageUrl, id, null).then((image) => {
        if (image) {
          methods.setValue('images', [image]);
        }
      });
    }
  }, [methods, initiativeImage]);

  useEffect(() => {
    const bannerUrl = initiative?.attributes.header_bg.large;

    if (bannerUrl) {
      convertUrlToUploadFile(bannerUrl, null, null).then((image) => {
        if (image) {
          methods.setValue('header_bg', [image]);
        }
      });
    }
  }, [methods, initiative]);

  useEffect(() => {
    (async () => {
      if (initiativeFiles) {
        const convertedFiles = initiativeFiles.map(
          async (f) =>
            await convertUrlToUploadFile(
              f.attributes.file.url,
              f.id,
              f.attributes.name
            )
        );

        const files = (await Promise.all(
          convertedFiles.filter((f) => f !== null)
        )) as UploadFile[];

        methods.setValue('local_initiative_files', files);
      }
    })();
  }, [methods, initiativeFiles]);

  if (!topics) return null;

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await onSubmit(formValues);
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
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
            <FormSection>
              <FormSectionTitle message={messages.formGeneralSectionTitle} />
              <SectionField id="e2e-initiative-form-title-section">
                <FormLabel
                  htmlFor="title_multiloc"
                  labelMessage={messages.titleLabel}
                  subtextMessage={messages.titleLabelSubtext2}
                >
                  <InputMultilocWithLocaleSwitcher
                    name="title_multiloc"
                    autocomplete="off"
                    maxCharCount={72}
                  />
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
                {/* {descriptionProfanityError && (
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
              <Warning>
                <>
                  <FormattedMessage {...messages.makeSureReadyToBePublic} />{' '}
                  {initiativeReviewRequired ? (
                    <FormattedMessage {...messages.notEditableOnceReviewed} />
                  ) : (
                    <FormattedMessage {...messages.notEditableOnceVoted} />
                  )}
                </>
              </Warning>
            </FormSection>
            <FormSection>
              <FormSectionTitle message={messages.formDetailsSectionTitle} />
              <SectionField aria-live="polite">
                <FormLabel
                  labelMessage={messages.topicsLabel}
                  subtextMessage={messages.topicsLabelDescription}
                />
                <TopicsPicker name="topic_ids" availableTopics={topics.data} />
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
            </FormSection>
            <Suspense fallback={null}>
              <CosponsorsFormSection
                cosponsorships={initiative?.attributes.cosponsorships}
              />
            </Suspense>
            <Suspense fallback={null}>
              <ImageAndAttachmentsSection />
            </Suspense>
            <Suspense fallback={null}>
              <ProfileVisibilityFormSection
                triggerModal={() => {
                  if (methods.watch('anonymous') === true) {
                    setShowAnonymousConfirmationModal(true);
                  }
                }}
              />
            </Suspense>
          </Box>
          <SubmitButtonBar processing={methods.formState.isSubmitting} />
        </form>
      </FormProvider>
      <Suspense fallback={null}>
        {showAnonymousConfirmationModal && (
          <AnonymousParticipationConfirmationModal
            onCloseModal={() => setShowAnonymousConfirmationModal(false)}
          />
        )}
      </Suspense>
    </>
  );
};

export default InitiativeForm;
