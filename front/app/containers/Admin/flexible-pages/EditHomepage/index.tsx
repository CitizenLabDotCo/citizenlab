import React from 'react';
import SectionToggle from '../SectionToggle';
import { Box, Title } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import AdminViewButton from './AdminViewButton';
import messages from './messages';
import useHomepageSettings from 'hooks/useHomepageSettings';
import { THomepageSection } from 'services/homepages';
import { isNilOrError } from 'utils/helperUtils';
import Outlet from 'components/Outlet';

const EditHomepage = () => {
  const homepageSettings = useHomepageSettings();

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
        <SectionToggle
          onChangeSectionToggle={handleOnChangeToggle(
            'customizable_homepage_banner'
          )}
          onClickEditButton={handleOnClick}
          titleMessageDescriptor={messages.heroBanner}
        />
        <SectionToggle
          onChangeSectionToggle={handleOnChangeToggle(
            'top_info_section_enabled'
          )}
          onClickEditButton={handleOnClick}
          titleMessageDescriptor={messages.topInfoSection}
        />
        <SectionToggle
          onChangeSectionToggle={handleOnChangeToggle('projects_enabled')}
          onClickEditButton={handleOnClick}
          titleMessageDescriptor={messages.projectsList}
        />
        {/* TO DO: move this toggle to module */}
        {/* <Outlet id="app.containers.Admin.flexible-pages.EditHomepage.index" /> */}
        <SectionToggle
          onChangeSectionToggle={handleOnChangeToggle('events_widget')}
          onClickEditButton={handleOnClick}
          titleMessageDescriptor={messages.events}
        />
        <SectionToggle
          onChangeSectionToggle={handleOnChangeToggle(
            'bottom_info_section_enabled'
          )}
          onClickEditButton={handleOnClick}
          titleMessageDescriptor={messages.bottomInfoSection}
        />
      </div>
    </>
  );
};

export default EditHomepage;
