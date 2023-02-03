import React, { useState } from 'react';

// components
import SectionToggle from '../../components/SectionToggle';
import { Box, Title } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import AdminViewButton from './AdminViewButton';
import SectionFormWrapper from '../../components/SectionFormWrapper';
import { pagesAndMenuBreadcrumb, homeBreadcrumb } from '../../breadcrumbs';

// i18n
import messages from './messages';
import sectionToggleMessages from 'containers/Admin/pagesAndMenu/components/SectionToggle/messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

// services, hooks, resources, and types
import Outlet from 'components/Outlet';
import {
  updateHomepageSettings,
  THomepageEnabledSetting,
} from 'services/homepageSettings';
import useHomepageSettings from 'hooks/useHomepageSettings';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { insertConfiguration } from 'utils/moduleUtils';
import { InsertConfigurationOptions } from 'typings';
import clHistory from 'utils/cl-router/history';
import { ISectionToggleData } from 'containers/Admin/pagesAndMenu/components/SectionToggle';

export interface IHomepageSectionToggleData extends ISectionToggleData {
  name: THomepageEnabledSetting | 'homepage_banner';
}

const EditHomepage = () => {
  const { formatMessage } = useIntl();
  const homepageSettings = useHomepageSettings();
  const [sectionTogglesData, setSectionTogglesData] = useState<
    IHomepageSectionToggleData[]
  >([
    {
      name: 'homepage_banner',
      titleMessage: formatMessage(sectionToggleMessages.heroBanner),
      tooltipMessage: formatMessage(sectionToggleMessages.heroBannerTooltip),
      linkToPath: 'homepage-banner',
      hideToggle: true,
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
      name: 'bottom_info_section_enabled',
      titleMessage: formatMessage(sectionToggleMessages.bottomInfoSection),
      tooltipMessage: formatMessage(
        sectionToggleMessages.bottomInfoSectionTooltip
      ),
      linkToPath: 'bottom-info-section',
    },
  ]);

  const handleOnChangeToggle =
    (sectionName: THomepageEnabledSetting | 'homepage_banner') => async () => {
      if (isNilOrError(homepageSettings)) {
        return;
      }
      try {
        await updateHomepageSettings({
          [sectionName]: !homepageSettings.attributes[sectionName],
        });
      } catch (error) {
        console.error(error);
      }
    };

  const handleOnData = (
    sectionToggleData: InsertConfigurationOptions<IHomepageSectionToggleData>
  ) => {
    setSectionTogglesData((currentSectionTogglesData) => {
      return insertConfiguration(sectionToggleData)(currentSectionTogglesData);
    });
  };

  const handleOnClick = (url: string) => {
    if (url) {
      clHistory.push(`/admin/pages-menu/homepage/${url}/`);
    }
  };

  if (isNilOrError(homepageSettings)) {
    return null;
  }

  return (
    <SectionFormWrapper
      title={formatMessage(messages.homepageTitle)}
      breadcrumbs={[
        {
          label: formatMessage(pagesAndMenuBreadcrumb.label),
          linkTo: pagesAndMenuBreadcrumb.linkTo,
        },
        {
          label: formatMessage(homeBreadcrumb.label),
        },
      ]}
      rightSideCTA={
        <AdminViewButton
          buttonTextMessageDescriptor={messages.viewPage}
          linkTo="/"
        />
      }
    >
      <Box mb="28px">
        <Warning>
          <FormattedMessage {...messages.sectionDescription} />
        </Warning>
      </Box>
      <Box display="flex" alignItems="center" mb="12px">
        <Title variant="h2">
          <FormattedMessage {...messages.sectionsTitle} />
        </Title>
      </Box>
      <Box display="flex" flexDirection="column">
        {sectionTogglesData.map((sectionToggleData, index) => {
          return (
            <SectionToggle
              sectionToggleData={sectionToggleData}
              key={sectionToggleData.name}
              checked={homepageSettings.attributes[sectionToggleData.name]}
              onChangeSectionToggle={handleOnChangeToggle(
                sectionToggleData.name
              )}
              onClickEditButton={handleOnClick}
              isLastItem={index === sectionTogglesData.length - 1}
            />
          );
        })}
        <Outlet
          id="app.containers.Admin.flexible-pages.EditHomepage.sectionToggles"
          onData={handleOnData}
        />
      </Box>
    </SectionFormWrapper>
  );
};

export default EditHomepage;
