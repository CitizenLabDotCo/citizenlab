import React, { useState } from 'react';
import SectionToggle from '../SectionToggle';
import { Box, Title } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import AdminViewButton from './AdminViewButton';
import messages from './messages';
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import {
  updateHomepageSettings,
  THomepageSection,
} from 'services/homepageSettings';
import useHomepageSettings from 'hooks/useHomepageSettings';
import { isNilOrError } from 'utils/helperUtils';

type TSectionToggleData = {
  titleMessageDescriptor: MessageDescriptor;
  tooltipMessageDescriptor: MessageDescriptor;
  sectionEnabledSettingName: THomepageSection;
};

const EditHomepage = () => {
  const homepageSettings = useHomepageSettings();

  const [isLoading, setIsLoading] = useState(false);

  const [sectionTogglesData, _setSectionTogglesData] = useState<
    TSectionToggleData[]
  >([
    {
      sectionEnabledSettingName: 'customizable_homepage_banner_enabled',
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

  const handleOnChangeToggle = (sectionName: THomepageSection) => async () => {
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

  const handleOnClick = () => {};

  if (isNilOrError(homepageSettings)) {
    return null;
  }

  return (
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
      <>
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
          ({
            sectionEnabledSettingName,
            titleMessageDescriptor,
            tooltipMessageDescriptor,
          }) => {
            return (
              <SectionToggle
                key={sectionEnabledSettingName}
                checked={
                  homepageSettings.data.attributes[sectionEnabledSettingName]
                }
                onChangeSectionToggle={handleOnChangeToggle(
                  sectionEnabledSettingName
                )}
                onClickEditButton={handleOnClick}
                titleMessageDescriptor={titleMessageDescriptor}
                tooltipMessageDescriptor={tooltipMessageDescriptor}
                disabled={isLoading}
              />
            );
          }
        )}
      </>
    </Box>
  );
};

export default EditHomepage;
