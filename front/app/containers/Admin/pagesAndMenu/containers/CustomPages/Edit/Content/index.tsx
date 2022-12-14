import React from 'react';

// components
import PageWrapper from 'components/admin/PageWrapper';
import SectionToggle, {
  ISectionToggleData,
} from 'containers/Admin/pagesAndMenu/components/SectionToggle';
import { Box } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';

// i18n
import messages from './messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import sectionToggleMessages from 'containers/Admin/pagesAndMenu/components/SectionToggle/messages';

// services
import {
  updateCustomPage,
  TCustomPageEnabledSetting,
} from 'services/customPages';

// hooks
import useCustomPage from 'hooks/useCustomPage';
import useFeatureFlag from 'hooks/useFeatureFlag';

// routing
import { useParams } from 'react-router-dom';

// utils
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

export interface ICustomPageSectionToggleData extends ISectionToggleData {
  name: TCustomPageEnabledSetting;
  hideSection?: boolean;
}

// types
const CustomPagesEditContent = () => {
  const { formatMessage } = useIntl();
  const { customPageId } = useParams() as { customPageId: string };
  const customPage = useCustomPage({ customPageId });
  const advancedCustomPagesEnabled = useFeatureFlag({
    name: 'advanced_custom_pages',
  });

  if (isNilOrError(customPage)) {
    return null;
  }

  const hideProjects =
    !advancedCustomPagesEnabled ||
    customPage.attributes.projects_filter_type === 'no_filter';

  const sectionTogglesData: ICustomPageSectionToggleData[] = [
    {
      name: 'banner_enabled',
      titleMessage: formatMessage(sectionToggleMessages.heroBanner),
      tooltipMessage: formatMessage(sectionToggleMessages.heroBannerTooltip),
      linkToPath: 'banner',
    },
    {
      name: 'top_info_section_enabled',
      titleMessage: formatMessage(sectionToggleMessages.topInfoSection),
      tooltipMessage: formatMessage(
        sectionToggleMessages.topInfoSectionTooltip
      ),
      linkToPath: 'top-info-section',
    },
    {
      name: 'files_section_enabled',
      titleMessage: formatMessage(sectionToggleMessages.attachmentsSection),
      tooltipMessage: formatMessage(
        sectionToggleMessages.attachmentsSectionTooltip
      ),
      linkToPath: 'attachments',
    },
    {
      name: 'projects_enabled',
      titleMessage: formatMessage(sectionToggleMessages.projectsList),
      tooltipMessage: (
        <FormattedMessage {...sectionToggleMessages.projectsListTooltip} />
      ),
      hideSection: hideProjects,
      linkToPath: 'projects',
    },
    {
      name: 'events_widget_enabled',
      titleMessage: formatMessage(sectionToggleMessages.eventsList),
      tooltipMessage: formatMessage(sectionToggleMessages.eventsListTooltip2),
      hideSection: hideProjects,
    },
    {
      name: 'bottom_info_section_enabled',
      titleMessage: formatMessage(sectionToggleMessages.bottomInfoSection),
      tooltipMessage: formatMessage(
        sectionToggleMessages.bottomInfoSectionTooltip
      ),
      linkToPath: 'bottom-info-section',
    },
  ];

  const handleOnChangeToggle =
    (sectionName: TCustomPageEnabledSetting) => async () => {
      if (isNilOrError(customPage)) {
        return;
      }
      try {
        await updateCustomPage(customPageId, {
          [sectionName]: !customPage.attributes[sectionName],
        });
      } catch (error) {
        console.error(error);
      }
    };

  const handleOnClick = (sectionPath: string) => {
    if (sectionPath) {
      clHistory.push(`/admin/pages-menu/pages/${customPageId}/${sectionPath}/`);
    }
  };

  return (
    <PageWrapper flatTopBorder>
      <Box display="flex" flexDirection="column">
        <Box mb="28px">
          <Warning>
            <FormattedMessage {...messages.sectionDescription} />
          </Warning>
        </Box>
        {sectionTogglesData.map((sectionToggleData, index) => {
          if (sectionToggleData.hideSection) {
            return;
          }
          return (
            <SectionToggle
              key={sectionToggleData.name}
              checked={customPage.attributes[sectionToggleData.name]}
              onChangeSectionToggle={handleOnChangeToggle(
                sectionToggleData.name
              )}
              onClickEditButton={handleOnClick}
              isLastItem={index === sectionTogglesData.length - 1}
              sectionToggleData={sectionToggleData}
            />
          );
        })}
      </Box>
    </PageWrapper>
  );
};

export default CustomPagesEditContent;
