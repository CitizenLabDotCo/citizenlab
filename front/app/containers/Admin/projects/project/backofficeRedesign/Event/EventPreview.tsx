import React from 'react';

import {
  Box,
  Icon,
  Image,
  Text,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import PhonePreviewBackdrop from 'containers/Admin/projects/_shared/components/PhonePreviewBackdrop';
import eventMessages from 'containers/Admin/projects/project/events/messages';
import { EventForm } from 'containers/Admin/projects/project/events/useEventForm';

import PhonePreviewFrame from 'components/admin/PhonePreview/PhonePreviewFrame';
import T from 'components/T';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { useIntl } from 'utils/cl-intl';
import { stripHtml } from 'utils/textUtils';

import AdminOnlyPlaceholder from './AdminOnlyPlaceholder';
import messages from './messages';
import PreviewAttachment from './PreviewAttachment';
import PreviewInfoCard from './PreviewInfoCard';

interface Props {
  project: IProjectData;
  form: EventForm;
}

const EventPreview = ({ project, form }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const theme = useTheme();
  const { data: appConfig } = useAppConfiguration();
  const logo = appConfig?.data.attributes.logo?.medium;
  const { attributes, image } = form;

  const title = localize(attributes.title_multiloc);
  const description = localize(attributes.description_multiloc);

  return (
    <PhonePreviewBackdrop>
      <PhonePreviewFrame
        screen={
          <Box
            h="100%"
            display="flex"
            flexDirection="column"
            background={colors.white}
            aria-hidden
          >
            <Box
              flex="0 0 56px"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              px="16px"
              borderBottom={`1px solid ${colors.divider}`}
            >
              {logo ? <Image src={logo} alt="" height="28px" /> : <span />}
              <Icon name="menu" fill={colors.textPrimary} />
            </Box>

            <Box
              flexGrow={1}
              overflowY="auto"
              display="flex"
              flexDirection="column"
              gap="16px"
              p="20px 16px 24px"
            >
              <Title
                variant="h2"
                m="0"
                color={title ? 'textPrimary' : 'coolGrey300'}
              >
                {title || formatMessage(messages.previewEventName)}
              </Title>

              <Box display="flex" gap="10px" alignItems="flex-start">
                <Box
                  flex="0 0 32px"
                  height="32px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="50%"
                  background={colors.grey100}
                >
                  <Icon
                    name="calendar"
                    width="16px"
                    height="16px"
                    fill={theme.colors.tenantPrimary}
                  />
                </Box>
                <Box>
                  <Text m="0" fontSize="s" color="textPrimary">
                    {formatMessage(messages.fromProject, {
                      project: localize(project.attributes.title_multiloc),
                    })}
                  </Text>
                  <Text
                    m="0"
                    fontSize="xs"
                    color="coolGrey600"
                    textDecoration="underline"
                  >
                    {formatMessage(messages.goToProject)}
                  </Text>
                </Box>
              </Box>

              {image ? (
                <Image
                  src={form.croppedImage ?? image.base64}
                  alt=""
                  width="100%"
                />
              ) : (
                <AdminOnlyPlaceholder
                  title={formatMessage(messages.previewEventImage)}
                />
              )}

              {stripHtml(description) ? (
                <QuillEditedContent fontSize="base">
                  <T value={attributes.description_multiloc} supportHtml />
                </QuillEditedContent>
              ) : (
                <AdminOnlyPlaceholder
                  title={formatMessage(messages.previewDescription)}
                />
              )}

              {form.files.attachments.map((attachment) => (
                <PreviewAttachment
                  key={attachment.id}
                  attachment={attachment}
                />
              ))}

              {attributes.start_at && attributes.end_at && (
                <PreviewInfoCard
                  startAt={attributes.start_at}
                  endAt={attributes.end_at}
                  attendeesCount={form.event?.attributes.attendees_count ?? 0}
                  address1={attributes.address_1}
                  address2Multiloc={attributes.address_2_multiloc}
                  hasLocationPoint={form.hasLocationPoint}
                  onlineLink={attributes.online_link}
                  buttonText={
                    (form.customButtonOn &&
                      localize(attributes.attend_button_multiloc)) ||
                    formatMessage(eventMessages.register)
                  }
                  showButtonIcon={!form.customButtonOn}
                />
              )}
            </Box>
          </Box>
        }
      />
    </PhonePreviewBackdrop>
  );
};

export default EventPreview;
