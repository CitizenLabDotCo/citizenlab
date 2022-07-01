import React, { useState } from 'react';
import SectionToggle from '../SectionToggle';
import { Box, Title } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import AdminViewButton from './AdminViewButton';
import messages from './messages';
import useHomepageSettings from 'hooks/useHomepageSettings';
import { THomepageSection, updateHomepageSettings } from 'services/homepageSettings';
import Outlet from 'components/Outlet';
import { MessageDescriptor } from 'utils/cl-intl';

type TSectionToggleData = {
  titleMessageDescriptor: MessageDescriptor;
  tooltipMessageDescriptor: MessageDescriptor;
  sectionEnabledSettingName: THomepageSection;
};

const EditHomepage = () => {
  const homepageSettings = useHomepageSettings();
  const [sectionTogglesData, setSectionTogglesData] = useState<
    TSectionToggleData[]
  >([
    {
      sectionEnabledSettingName: 'customizable_homepage_banner',
      titleMessageDescriptor: messages.heroBanner,
      tooltipMessageDescriptor: messages.heroBannerTooltip,
    },
    {
      sectionEnabledSettingName: 'top_info_section_enabled',
      titleMessageDescriptor: messages.topInfoSection,
      tooltipMessageDescriptor: messages.topInfoSectionTooltip,
    },
    {
      sectionEnabledSettingName: 'projects_enabled',
      titleMessageDescriptor: messages.projectsList,
      tooltipMessageDescriptor: messages.projectsListTooltip,
    },
    {
      sectionEnabledSettingName: 'bottom_info_section_enabled',
      titleMessageDescriptor: messages.bottomInfoSection,
      tooltipMessageDescriptor: messages.bottomInfoSectionTooltip,
    },
  ]);

  const handleOnChangeToggle = (sectionName: THomepageSection) => () => {
    handleUpdateHomepageSettings(sectionName);
  };

  const handleUpdateHomepageSettings = async (
    sectionName: THomepageSection
  ) => {
    try {
    } catch (error) {}
  };

  const handleOnClick = () => {};
  return (
    <>
      <Box display="flex" alignItems="center" mb="12px">
        {/* Title should have no default margins. If I set margin to 0, it still gets overwritten. */}
        <Title variant="h2">Homepage</Title>
        {/* Should this happen with a Box? */}
        <Box ml="auto">
          <AdminViewButton
            buttonTextMessageDescriptor={messages.viewPage}
            linkTo="/"
          />
        </Box>
      </Box>
      <div>
        {/*
       How do we deal with margins on Title to not make the tech debt worse here?
         + be consistent

       Also font-weight is an issue again.

       Should I use a Box for this? Or go with a StyledWarning?
       */}
        <Box mb="28px">
          <Warning>
            Your platform homepage consists of the following sections. You can
            turn them on/off and edit them as required.
          </Warning>
        </Box>
        {sectionTogglesData.map(
          ({
            sectionEnabledSettingName,
            titleMessageDescriptor,
            tooltipMessageDescriptor,
          }) => {
            return (
              <SectionToggle
                onChangeSectionToggle={handleOnChangeToggle(
                  sectionEnabledSettingName
                )}
                onClickEditButton={handleOnClick}
                titleMessageDescriptor={titleMessageDescriptor}
                tooltipMessageDescriptor={tooltipMessageDescriptor}
              />
            );
          }
        )}

        {/* TO DO: move this toggle to module */}
        <SectionToggle
          onChangeSectionToggle={handleOnChangeToggle('events_widget')}
          onClickEditButton={handleOnClick}
          titleMessageDescriptor={messages.eventsWidget}
          tooltipMessageDescriptor={messages.eventsWidgetTooltip}
        />
        <Outlet id="app.containers.Admin.flexible-pages.EditHomepage.sectionToggles" />
      </div>
    </>
  );
};

export default EditHomepage;
