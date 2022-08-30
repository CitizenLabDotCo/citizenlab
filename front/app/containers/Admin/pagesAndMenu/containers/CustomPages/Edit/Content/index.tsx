import React, { useState } from 'react';

// components
import PageWrapper from 'components/admin/PageWrapper';
import SectionToggle from 'containers/Admin/pagesAndMenu/SectionToggle';
import { Box } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';

// i18n
import messages from './messages';
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import sectionToggleMessages from 'containers/Admin/pagesAndMenu/SectionToggle/messages';

// services
import {
  updateCustomPage,
  TCustomPageEnabledSetting,
} from 'services/customPages';

// hooks
import useCustomPage from 'hooks/useCustomPage';

// routing
import { useParams } from 'react-router-dom';

// utils
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

export type TCustomPageSectionToggleData = {
  name: TCustomPageEnabledSetting;
  titleMessageDescriptor: MessageDescriptor;
  tooltipMessageDescriptor: MessageDescriptor;
  linkToPath?: string;
  hideToggle?: boolean;
};

// types
const CustomPagesEditContent = () => {
  const [isLoading, setIsLoading] = useState(false);
  // to be typed
  const { customPageId } = useParams() as { customPageId: string };
  const customPage = useCustomPage(customPageId);

  if (!customPage) {
    return null;
  }

  const sectionTogglesData: TCustomPageSectionToggleData[] = [
    {
      name: 'banner_enabled',
      titleMessageDescriptor: sectionToggleMessages.heroBanner,
      tooltipMessageDescriptor: sectionToggleMessages.heroBannerTooltip,
      linkToPath: 'homepage-banner',
    },
    {
      name: 'top_info_section_enabled',
      titleMessageDescriptor: sectionToggleMessages.topInfoSection,
      tooltipMessageDescriptor: sectionToggleMessages.topInfoSectionTooltip,
      linkToPath: 'top-info-section',
    },
    {
      name: 'projects_enabled',
      titleMessageDescriptor: sectionToggleMessages.projectsList,
      tooltipMessageDescriptor: sectionToggleMessages.projectsListTooltip,
      linkToPath: 'projects',
    },
    {
      name: 'events_enabled',
      titleMessageDescriptor: sectionToggleMessages.eventsList,
      tooltipMessageDescriptor: sectionToggleMessages.eventsListTooltip,
    },
    {
      name: 'bottom_info_section_enabled',
      titleMessageDescriptor: sectionToggleMessages.bottomInfoSection,
      tooltipMessageDescriptor: sectionToggleMessages.bottomInfoSectionTooltip,
      linkToPath: 'bottom-info-section',
    },
    {
      name: 'attachments_enabled',
      titleMessageDescriptor: sectionToggleMessages.attachmentsSection,
      tooltipMessageDescriptor: sectionToggleMessages.attachmentsSectionTooltip,
      linkToPath: 'attachments',
      // until things are typed properly
      hideToggle: false,
    },
  ];

  const handleOnChangeToggle =
    (sectionName: TCustomPageEnabledSetting) => async () => {
      if (isNilOrError(customPage)) {
        return;
      }
      setIsLoading(true);
      try {
        await updateCustomPage(customPageId, {
          [sectionName]: !customPage.attributes[sectionName],
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

  // const handleOnChangeToggle = (sectionName: string) => async () => {
  //   updateCustomPage(customPageId, {
  //     [sectionName]: true,
  //   });
  //   return sectionName;
  // };

  const handleOnClick = (sectionPath: string) => {
    if (sectionPath) {
      // add in actual page ID to string here
      clHistory.push(
        `/admin/pages-menu/custom/${customPageId}/${sectionPath}/`
      );
    }
  };

  return (
    <PageWrapper>
      <Box display="flex" flexDirection="column">
        <Box mb="28px">
          <Warning>
            <FormattedMessage {...messages.sectionDescription} />
          </Warning>
        </Box>
        {sectionTogglesData.map(
          (
            {
              name,
              titleMessageDescriptor,
              tooltipMessageDescriptor,
              linkToPath,
              hideToggle,
            },
            index
          ) => {
            return (
              <SectionToggle
                key={name}
                name={name}
                checked={true}
                onChangeSectionToggle={handleOnChangeToggle(name)}
                onClickEditButton={handleOnClick}
                editLinkPath={linkToPath}
                titleMessageDescriptor={titleMessageDescriptor}
                tooltipMessageDescriptor={tooltipMessageDescriptor}
                disabled={isLoading}
                isLastItem={index === sectionTogglesData.length - 1}
                hideToggle={hideToggle}
              />
            );
          }
        )}
      </Box>
    </PageWrapper>
  );
};

export default CustomPagesEditContent;
