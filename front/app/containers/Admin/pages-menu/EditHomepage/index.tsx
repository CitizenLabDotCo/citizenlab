import React, { useState } from 'react';

// components
import SectionToggle from '../SectionToggle';
import { Box, Title } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';
import AdminViewButton from './AdminViewButton';
import SectionFormWrapper from '../components/SectionFormWrapper';
import { pagesAndMenuBreadcrumb, homeBreadcrumb } from '../breadcrumbs';

// i18n
import messages from './messages';
import { FormattedMessage, injectIntl, MessageDescriptor } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

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

export type TSectionToggleData = {
  name: THomepageEnabledSetting;
  titleMessageDescriptor: MessageDescriptor;
  tooltipMessageDescriptor: MessageDescriptor;
  linkToPath?: string;
  hideToggle?: boolean;
};

const EditHomepage = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const homepageSettings = useHomepageSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [sectionTogglesData, setSectionTogglesData] = useState<
    TSectionToggleData[]
  >([
    {
      name: 'customizable_homepage_banner_enabled',
      titleMessageDescriptor: messages.heroBanner,
      tooltipMessageDescriptor: messages.heroBannerTooltip,
      linkToPath: 'homepage-banner',
      hideToggle: true,
    },
    {
      name: 'top_info_section_enabled',
      titleMessageDescriptor: messages.topInfoSection,
      tooltipMessageDescriptor: messages.topInfoSectionTooltip,
      linkToPath: 'top-info-section',
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
      linkToPath: 'bottom-info-section',
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
    setSectionTogglesData((currentSectionTogglesData) => {
      return insertConfiguration(sectionToggleData)(currentSectionTogglesData);
    });
  };

  const handleOnClick = (url: string) => {
    if (url) {
      clHistory.push(`/admin/pages-menu/${url}/`);
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
    >
      <Box display="flex" alignItems="center" mb="12px">
        <Title variant="h2">
          <FormattedMessage {...messages.sectionsTitle} />
        </Title>
        <Box ml="auto">
          <AdminViewButton
            buttonTextMessageDescriptor={messages.viewPage}
            linkTo="/"
          />
        </Box>
      </Box>
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
                checked={homepageSettings.data.attributes[name]}
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
        <Outlet
          id="app.containers.Admin.flexible-pages.EditHomepage.sectionToggles"
          onData={handleOnData}
        />
      </Box>
    </SectionFormWrapper>
  );
};

export default injectIntl(EditHomepage);
