import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'utils/router';

import { TCustomPageEnabledSetting } from 'api/custom_pages/types';
import useCustomPageById from 'api/custom_pages/useCustomPageById';
import useUpdateCustomPage from 'api/custom_pages/useUpdateCustomPage';

import useFeatureFlag from 'hooks/useFeatureFlag';

import SectionToggle, {
  ISectionToggleData,
} from 'containers/Admin/pagesAndMenu/components/SectionToggle';
import sectionToggleMessages from 'containers/Admin/pagesAndMenu/components/SectionToggle/messages';

import PageWrapper from 'components/admin/PageWrapper';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

export interface ICustomPageSectionToggleData extends ISectionToggleData {
  name: TCustomPageEnabledSetting;
  hideSection?: boolean;
}

const CustomPagesEditContent = () => {
  const { mutate: updateCustomPage } = useUpdateCustomPage();
  const { formatMessage } = useIntl();
  const { customPageId } = useParams({ strict: false }) as {
    customPageId: string;
  };
  const { data: customPage } = useCustomPageById(customPageId);
  const advancedCustomPagesEnabled = useFeatureFlag({
    name: 'advanced_custom_pages',
  });

  if (isNilOrError(customPage)) {
    return null;
  }

  const hideProjects =
    !advancedCustomPagesEnabled ||
    customPage.data.attributes.projects_filter_type === 'no_filter';

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
      updateCustomPage({
        id: customPageId,
        [sectionName]: !customPage.data.attributes[sectionName],
      });
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
              checked={customPage.data.attributes[sectionToggleData.name]}
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
