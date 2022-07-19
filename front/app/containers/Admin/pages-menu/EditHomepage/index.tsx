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
import {
  updateHomepageSettings,
  THomepageSection,
} from 'services/homepageSettings';
import useHomepageSettings from 'hooks/useHomepageSettings';

// utils
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

type TSectionToggleData = {
  titleMessageDescriptor: MessageDescriptor;
  tooltipMessageDescriptor: MessageDescriptor;
  sectionEnabledSettingName: THomepageSection;
  linkToPath?: string;
};

const EditHomepage = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const homepageSettings = useHomepageSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [sectionTogglesData, _setSectionTogglesData] = useState<
    TSectionToggleData[]
  >([
    {
      sectionEnabledSettingName: 'customizable_homepage_banner_enabled',
      titleMessageDescriptor: messages.heroBanner,
      tooltipMessageDescriptor: messages.heroBannerTooltip,
      linkToPath: 'homepage-banner',
    },
    {
      sectionEnabledSettingName: 'top_info_section_enabled',
      titleMessageDescriptor: messages.topInfoSection,
      tooltipMessageDescriptor: messages.topInfoSectionTooltip,
      linkToPath: 'top-info-section',
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
      linkToPath: 'bottom-info-section',
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
        {/* Title should have no default margins. If I set margin to 0, it still gets overwritten. */}
        <Title variant="h2">
          <FormattedMessage {...messages.sectionsTitle} />
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
          ({
            sectionEnabledSettingName,
            titleMessageDescriptor,
            tooltipMessageDescriptor,
            linkToPath,
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
                editLinkPath={linkToPath}
                titleMessageDescriptor={titleMessageDescriptor}
                tooltipMessageDescriptor={tooltipMessageDescriptor}
                disabled={isLoading}
              />
            );
          }
        )}
      </Box>
    </SectionFormWrapper>
  );
};

export default injectIntl(EditHomepage);
