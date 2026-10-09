import React, { FormEvent, lazy } from 'react';

import {
  Box,
  IconTooltip,
  Input,
  Label,
  Spinner,
  Text,
  Title,
  Toggle,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';
import { Multiloc } from 'typings';

import useContainerWidthAndHeight from 'hooks/useContainerWidthAndHeight';
import useLocale from 'hooks/useLocale';

import projectMessages from 'containers/Admin/projects/project/general/messages';

import ImageCropperContainer from 'components/admin/ImageCropper/Container';
import { Section, SectionTitle, SectionField } from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import ErrorComponent from 'components/UI/Error';
import FileRepositorySelectAndUpload from 'components/UI/FileRepositorySelectAndUpload';
import GoBackButton from 'components/UI/GoBackButton';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import LocationInput, { Option } from 'components/UI/LocationInput';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import { useParams } from 'utils/router';
import { defaultAdminCardPadding } from 'utils/styleConstants';

import DateTimeSelection from './components/DateTimeSelection';
import messages from './messages';
import useEventForm from './useEventForm';

const EventMap = lazy(() => import('./components/EventMap'));

const AdminProjectEventEdit = () => {
  const { projectId } = useParams({
    from: '/$locale/admin/projects/$projectId',
  });
  const { id: eventId } = useParams({ strict: false });
  const { formatMessage } = useIntl();
  const theme = useTheme();
  const locale = useLocale();
  const { width, containerRef } = useContainerWidthAndHeight();
  const form = useEventForm({ projectId, eventId });
  const { attributes, errors } = form;

  const handleOnSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const isNew = !form.event;

    try {
      await form.save();
    } catch {
      return;
    }

    if (isNew) {
      // Navigate after a short delay to show the success state
      setTimeout(() => {
        clHistory.push(`/admin/projects/${projectId}/events`);
      }, 1000);
    }
  };

  if (form.isLoading) {
    return <Spinner />;
  }

  return (
    <Box mt="44px" mx="44px">
      <Box bg={colors.white} borderRadius={stylingConsts.borderRadius} p="44px">
        {projectId && (
          <GoBackButton
            to="/admin/projects/$projectId/events"
            params={{ projectId }}
          />
        )}
        <Box ref={containerRef}>
          <SectionTitle>
            {form.event && <FormattedMessage {...messages.editEventTitle} />}
            {!form.event && <FormattedMessage {...messages.newEventTitle} />}
          </SectionTitle>

          <form className="e2e-project-event-edit" onSubmit={handleOnSubmit}>
            <Section>
              <SectionField>
                <InputMultilocWithLocaleSwitcher
                  id="title"
                  label={<FormattedMessage {...messages.titleLabel} />}
                  type="text"
                  valueMultiloc={attributes.title_multiloc}
                  onChange={(title_multiloc: Multiloc) =>
                    form.updateAttributes({ title_multiloc })
                  }
                />
                <ErrorComponent apiErrors={errors?.title_multiloc} />
              </SectionField>

              <SectionField className="fullWidth">
                <Box width="860px">
                  <QuillMultilocWithLocaleSwitcher
                    id="description"
                    label={<FormattedMessage {...messages.descriptionLabel} />}
                    valueMultiloc={attributes.description_multiloc}
                    onChange={(description_multiloc: Multiloc) =>
                      form.updateAttributes({ description_multiloc })
                    }
                    withCTAButton
                  />
                </Box>
                <ErrorComponent apiErrors={errors?.description_multiloc} />
              </SectionField>
              <SectionField>
                <Label>{formatMessage(messages.eventImage)}</Label>

                {!form.imageNeedsCrop && (
                  <ImagesDropzone
                    images={form.image ? [form.image] : []}
                    maxImagePreviewWidth="360px"
                    objectFit="contain"
                    acceptedFileTypes={{
                      'image/*': ['.jpg', '.jpeg', '.png'],
                    }}
                    onAdd={form.addImage}
                    onRemove={form.removeImage}
                    imagePreviewRatio={1 / 3}
                  />
                )}

                {form.imageNeedsCrop && (
                  <Box display="flex" flexDirection="column" gap="8px">
                    <ImageCropperContainer
                      image={form.image}
                      onComplete={form.cropImage}
                      aspectRatioWidth={3}
                      aspectRatioHeight={1}
                      onRemove={form.removeImage}
                    />
                  </Box>
                )}
              </SectionField>
              {form.image && (
                <SectionField>
                  <Label>
                    <FormattedMessage {...messages.eventImageAltTextTitle} />
                    <IconTooltip
                      content={
                        <FormattedMessage
                          {...projectMessages.projectImageAltTextTooltip}
                        />
                      }
                    />
                  </Label>
                  <InputMultilocWithLocaleSwitcher
                    type="text"
                    valueMultiloc={form.imageAltText}
                    label={<FormattedMessage {...projectMessages.altText} />}
                    onChange={form.changeImageAltText}
                  />
                </SectionField>
              )}

              <Title variant="h4" color="primary" fontWeight="semi-bold">
                {formatMessage(messages.eventDates)}
              </Title>
              {attributes.start_at && attributes.end_at && (
                <DateTimeSelection
                  startAt={attributes.start_at}
                  endAt={attributes.end_at}
                  errors={errors}
                  setAttributeDiff={form.updateAttributeDiff}
                />
              )}

              <Title variant="h4" color="primary" fontWeight="semi-bold">
                {formatMessage(messages.eventLocation)}
              </Title>
              <SectionField>
                <Box mt="16px" maxWidth="400px">
                  <Input
                    id="event-location"
                    label={formatMessage(messages.onlineEventLinkLabel)}
                    type="text"
                    value={attributes.online_link}
                    onChange={(online_link: string) =>
                      form.updateAttributes({ online_link })
                    }
                    labelTooltipText={formatMessage(
                      messages.onlineEventLinkTooltip
                    )}
                    placeholder={'https://...'}
                  />
                </Box>
                <ErrorComponent apiErrors={errors?.online_link} />
              </SectionField>

              <SectionField>
                <Box maxWidth="400px">
                  <Box mb="8px">
                    <Label>
                      {formatMessage(messages.addressOneLabel)}
                      <IconTooltip
                        content={formatMessage(messages.addressOneTooltip)}
                      />
                    </Label>
                  </Box>

                  <LocationInput
                    id="event-location-picker"
                    className="e2e-event-location-input"
                    value={
                      attributes.address_1
                        ? {
                            value: attributes.address_1,
                            label: attributes.address_1,
                          }
                        : null
                    }
                    onChange={(option: Option | null) => {
                      form.updateAttributes({ address_1: option?.value ?? '' });
                    }}
                    placeholder={formatMessage(messages.searchForLocation)}
                  />

                  <ErrorComponent apiErrors={errors?.address_1} />
                  <Box mt="20px" mb="8px">
                    <InputMultilocWithLocaleSwitcher
                      id="event-address-2"
                      label={formatMessage(messages.addressTwoLabel)}
                      type="text"
                      valueMultiloc={attributes.address_2_multiloc}
                      onChange={(address_2_multiloc: Multiloc) =>
                        form.updateAttributes({ address_2_multiloc })
                      }
                      labelTooltipText={formatMessage(
                        messages.addressTwoTooltip
                      )}
                      placeholder={formatMessage(
                        messages.addressTwoPlaceholder
                      )}
                    />
                  </Box>
                  {form.hasLocationPoint && (
                    <Box maxWidth="400px" zIndex="0">
                      <Box display="flex">
                        <Text color="coolGrey600" my="4px" mr="4px">
                          {formatMessage(messages.refineOnMap)}
                        </Text>
                        <IconTooltip
                          content={formatMessage(
                            messages.refineOnMapInstructions
                          )}
                        />
                      </Box>

                      <Box>
                        <EventMap
                          mapHeight="230px"
                          setLocationPoint={form.moveLocationPoint}
                          position={form.mapPosition}
                        />
                      </Box>
                    </Box>
                  )}
                </Box>
              </SectionField>

              <Title
                variant="h4"
                color="primary"
                fontWeight="semi-bold"
                mt="48px"
              >
                {formatMessage(messages.registrationLimit)}
              </Title>
              <SectionField>
                <Toggle
                  label={
                    <Box display="flex">
                      {formatMessage(messages.toggleRegistrationLimitLabel)}
                      <Box ml="4px">
                        <IconTooltip
                          content={formatMessage(
                            messages.toggleRegistrationLimitTooltip
                          )}
                        />
                      </Box>
                    </Box>
                  }
                  checked={form.registrationLimitOn}
                  onChange={form.toggleRegistrationLimit}
                />
              </SectionField>
              {form.registrationLimitOn && (
                <SectionField>
                  <Input
                    id="maximum_attendees"
                    label={formatMessage(messages.maximumRegistrants)}
                    type="number"
                    value={attributes.maximum_attendees?.toString()}
                    onChange={form.setMaximumAttendees}
                  />
                  <ErrorComponent
                    fieldName="maximum_attendees"
                    apiErrors={errors?.maximum_attendees}
                  />
                </SectionField>
              )}

              <Title
                variant="h4"
                color="primary"
                fontWeight="semi-bold"
                mt="48px"
              >
                {formatMessage(messages.registerButton)}
              </Title>
              <SectionField>
                <Toggle
                  label={
                    <Box display="flex">
                      {formatMessage(messages.toggleCustomRegisterButtonLabel)}
                      <Box ml="4px">
                        <IconTooltip
                          content={formatMessage(
                            messages.toggleCustomRegisterButtonTooltip2
                          )}
                        />
                      </Box>
                    </Box>
                  }
                  checked={form.customButtonOn}
                  onChange={form.toggleCustomButton}
                />
              </SectionField>
              {form.customButtonOn && (
                <>
                  <SectionField>
                    <Box maxWidth="400px">
                      <InputMultilocWithLocaleSwitcher
                        id="custom-button-text"
                        label={formatMessage(messages.customButtonText)}
                        type="text"
                        valueMultiloc={attributes.attend_button_multiloc}
                        onChange={(attend_button_multiloc: Multiloc) =>
                          form.updateAttributes({ attend_button_multiloc })
                        }
                        labelTooltipText={formatMessage(
                          messages.customButtonTextTooltip3
                        )}
                        maxCharCount={28}
                      />
                    </Box>
                  </SectionField>
                  <SectionField>
                    <Box maxWidth="400px">
                      <Input
                        label={formatMessage(messages.customButtonLink)}
                        type="text"
                        value={attributes.using_url}
                        onChange={(using_url: string) =>
                          form.updateAttributes({ using_url })
                        }
                        labelTooltipText={formatMessage(
                          messages.customButtonLinkTooltip
                        )}
                        placeholder={'https://...'}
                      />
                    </Box>
                    <ErrorComponent apiErrors={errors?.using_url} />
                  </SectionField>
                  {!isNilOrError(locale) && (
                    <Box display="flex" flexWrap="wrap">
                      <Box width="100%">
                        <Label>{formatMessage(messages.preview)}</Label>
                      </Box>
                      <ButtonWithLink
                        minWidth="160px"
                        bgColor={theme.colors.tenantPrimary}
                        linkTo={attributes.using_url}
                        openLinkInNewTab={true}
                      >
                        {attributes.attend_button_multiloc?.[locale] ||
                          formatMessage(messages.register)}
                      </ButtonWithLink>
                    </Box>
                  )}
                </>
              )}

              <Title
                variant="h4"
                color="primary"
                fontWeight="semi-bold"
                mt="48px"
              >
                {formatMessage(messages.additionalInformation)}
              </Title>
              <SectionField>
                <Label>
                  <FormattedMessage {...messages.fileUploadLabel} />
                  <IconTooltip
                    content={
                      <FormattedMessage {...messages.fileUploadLabelTooltip} />
                    }
                  />
                </Label>
                <FileRepositorySelectAndUpload
                  id="project-events-edit-form-file-uploader"
                  onFileAdd={form.files.uploadFile}
                  onFileRemove={form.files.removeFile}
                  onFileReorder={form.files.reorderFiles}
                  onFileAttach={form.files.attachFile}
                  fileAttachments={form.files.attachments}
                  enableDragAndDrop
                  apiErrors={errors}
                  maxSizeMb={10}
                  isUploadingFile={form.files.isUploadingFile}
                />
              </SectionField>
            </Section>

            <Box
              position="fixed"
              borderTop={`1px solid ${colors.divider}`}
              bottom="0"
              w={`calc(${width}px + ${defaultAdminCardPadding * 2}px)`}
              ml={`-${defaultAdminCardPadding}px`}
              background={colors.white}
              display="flex"
              justifyContent="flex-start"
            >
              <Box py="8px" px={`${defaultAdminCardPadding}px`}>
                <SubmitWrapper
                  loading={form.saving}
                  status={form.status}
                  messages={{
                    buttonSave: messages.saveButtonLabel,
                    buttonSuccess: messages.saveSuccessLabel,
                    messageError: messages.saveErrorMessage,
                    messageSuccess: messages.saveSuccessMessage,
                  }}
                />
              </Box>
            </Box>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminProjectEventEdit;
