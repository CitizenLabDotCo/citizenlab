import React, { useState } from 'react';
import SectionToggle from '../SectionToggle';
import { Box, Title } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import AdminViewButton from './AdminViewButton';
import messages from './messages';
import Outlet from 'components/Outlet';
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import {
  updateHomepageSettings,
  THomepageEnabledSetting,
} from 'services/homepageSettings';
import useHomepageSettings from 'hooks/useHomepageSettings';
import { isNilOrError } from 'utils/helperUtils';
import { insertConfiguration } from 'utils/moduleUtils';
import { InsertConfigurationOptions } from 'typings';

export type TSectionToggleData = {
  name: THomepageEnabledSetting;
  titleMessageDescriptor: MessageDescriptor;
  tooltipMessageDescriptor: MessageDescriptor;
};

const EditHomepage = () => {
  const homepageSettings = useHomepageSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [sectionTogglesData, setSectionTogglesData] = useState<
    TSectionToggleData[]
  >([
    {
      name: 'customizable_homepage_banner_enabled',
      titleMessageDescriptor: messages.heroBanner,
      tooltipMessageDescriptor: messages.heroBannerTooltip,
    },
    {
      name: 'top_info_section_enabled',
      titleMessageDescriptor: messages.topInfoSection,
      tooltipMessageDescriptor: messages.topInfoSectionTooltip,
    },
    {
      name: 'projects_enabled',
      titleMessageDescriptor: messages.projectsList,
      tooltipMessageDescriptor: messages.projectsListTooltip,
    },
    {
      name: 'bottom_info_section_enabled',
      titleMessageDescriptor: messages.bottomInfoSection,
      tooltipMessageDescriptor: messages.bottomInfoSectionTooltip,
    },
  ]);

  const handleOnChangeToggle =
    (sectionName: THomepageEnabledSetting) => async () => {
      if (isNilOrError(homepageSettings)) {
        return;
      }
      setIsLoading(true);
      try {
        await updateHomepageSettings({
          [sectionName]: !homepageSettings.data.attributes[sectionName],
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

  const handleOnData = (
    sectionToggleData: InsertConfigurationOptions<TSectionToggleData>
  ) => {
    setSectionTogglesData(insertConfiguration(sectionToggleData));
  };

  const handleOnClick = () => {};

  if (isNilOrError(homepageSettings)) {
    return null;
  }

  return (
    <>
      <Box display="flex" alignItems="center" mb="12px">
        {/* Title should have no default margins. If I set margin to 0, it still gets overwritten. */}
        <Title variant="h2">
          <FormattedMessage {...messages.homepageTitle} />
        </Title>
        {/* Should this happen with a Box? */}
        <Box ml="auto">
          <AdminViewButton
            buttonTextMessageDescriptor={messages.viewPage}
            linkTo="/"
          />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column">
        {/*
         How do we deal with margins on Title to not make the tech debt worse here?
           + be consistent

         Also font-weight is an issue again.

       Should I use a Box for this? Or go with a StyledWarning?
       */}
        <Box mb="28px">
          <Warning>
            <FormattedMessage {...messages.sectionDescription} />
          </Warning>
        </Box>
        {sectionTogglesData.map(
          ({ name, titleMessageDescriptor, tooltipMessageDescriptor }) => {
            return (
              <SectionToggle
                key={name}
                checked={homepageSettings.data.attributes[name]}
                onChangeSectionToggle={handleOnChangeToggle(name)}
                onClickEditButton={handleOnClick}
                titleMessageDescriptor={titleMessageDescriptor}
                tooltipMessageDescriptor={tooltipMessageDescriptor}
                disabled={isLoading}
              />
            );
          }
        )}
        <Outlet
          id="app.containers.Admin.flexible-pages.EditHomepage.sectionToggles"
          onData={handleOnData}
        />
      </Box>
    </>
  );
};

export default EditHomepage;
