import React from 'react';

// The preview copies the citizen event page, whose icons the design-system
// set doesn't have.
import { Icon } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import PhonePreviewBackdrop from 'containers/Admin/projects/_shared/components/PhonePreviewBackdrop';
import { EventForm } from 'containers/Admin/projects/_shared/events/useEventForm';
import eventMessages from 'containers/Admin/projects/project/events/messages';

import PhonePreviewFrame from 'components/admin/PhonePreview/PhonePreviewFrame';
import T from 'components/T';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { useIntl } from 'utils/cl-intl';
import { stripHtml } from 'utils/textUtils';

import AdminOnlyPlaceholder from './AdminOnlyPlaceholder';
import styles from './EventPreview.module.css';
import messages from './messages';
import PreviewAttachment from './PreviewAttachment';
import PreviewInfoCard from './PreviewInfoCard';
import 'design-system/tokens.css';

interface Props {
  project: IProjectData;
  form: EventForm;
}

const EventPreview = ({ project, form }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: appConfig } = useAppConfiguration();
  const logo = appConfig?.data.attributes.logo?.medium;
  const tenantColor =
    appConfig?.data.attributes.settings.core.color_main ?? undefined;
  const { attributes, image } = form;

  const title = localize(attributes.title_multiloc);
  const description = localize(attributes.description_multiloc);

  return (
    <PhonePreviewBackdrop>
      <PhonePreviewFrame
        screen={
          <div className={styles.screen} aria-hidden>
            <div className={styles.navBar}>
              {logo ? (
                <img src={logo} alt="" className={styles.logo} />
              ) : (
                <span />
              )}
              <Icon
                name="menu"
                fill="currentColor"
                className={styles.menuIcon}
              />
            </div>

            <div className={styles.content}>
              <h2 className={title ? styles.title : styles.titlePlaceholder}>
                {title || formatMessage(messages.previewEventName)}
              </h2>

              <div className={styles.project}>
                <div className={styles.projectIcon}>
                  <Icon
                    name="calendar"
                    width="16px"
                    height="16px"
                    fill={tenantColor}
                  />
                </div>
                <div>
                  <p className={styles.projectName}>
                    {formatMessage(messages.fromProject, {
                      project: localize(project.attributes.title_multiloc),
                    })}
                  </p>
                  <p className={styles.projectLink}>
                    {formatMessage(messages.goToProject)}
                  </p>
                </div>
              </div>

              {image ? (
                <img
                  src={form.croppedImage ?? image.base64}
                  alt=""
                  className={styles.image}
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
            </div>
          </div>
        }
      />
    </PhonePreviewBackdrop>
  );
};

export default EventPreview;
