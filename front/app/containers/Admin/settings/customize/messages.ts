/*
 * AdminPage.SettingsPage Messages
 *
 * This contains all the text for the AdminPage.SettingsPage component.
 */

import { defineMessages } from 'react-intl';

export default defineMessages({
  color_primary: {
    id: 'app.containers.AdminPage.SettingsPage.color_primary',
    defaultMessage: 'Primary color',
  },
  color_secondary: {
    id: 'app.containers.AdminPage.SettingsPage.color_secondary',
    defaultMessage: 'Secondary color',
  },
  color_text: {
    id: 'app.containers.AdminPage.SettingsPage.color_text',
    defaultMessage: 'Text color',
  },
  logo: {
    id: 'app.containers.AdminPage.SettingsPage.logo',
    defaultMessage: 'Logo',
  },
  header: {
    id: 'app.containers.AdminPage.SettingsPage.header',
    defaultMessage: 'Homepage header',
  },
  header_bg: {
    id: 'app.containers.AdminPage.SettingsPage.header_bg',
    defaultMessage: 'Header image',
  },
  header_bgTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.header_bgTooltip',
    defaultMessage:
      'Shown on the home page. Recommended dimensions are 1440x480.',
  },
  bannerHeaderSignedOut: {
    id: 'app.containers.AdminPage.SettingsPage.bannerHeaderSignedOut',
    defaultMessage: 'Header text for non-registered visitors',
  },
  bannerHeaderSignedOutTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.bannerHeaderSignedOutTooltip',
    defaultMessage: 'This text is shown on the banner image.',
  },
  titleMaxCharError: {
    id: 'app.containers.AdminPage.SettingsPage.titleMaxCharError',
    defaultMessage:
      'The provided title exceeds the maximum allowed character limit',
  },
  bannerHeaderSignedOutSubtitle: {
    id: 'app.containers.AdminPage.SettingsPage.bannerHeaderSignedOutSubtitle',
    defaultMessage: 'Sub-header text for non-registered visitors',
  },
  subtitleMaxCharError: {
    id: 'app.containers.AdminPage.SettingsPage.subtitleMaxCharError',
    defaultMessage:
      'The provided subtitle exceeds the maximum allowed character limit',
  },
  bannerDisplayHeaderAvatars: {
    id: 'app.containers.AdminPage.SettingsPage.bannerDisplayHeaderAvatars',
    defaultMessage: 'Display avatars',
  },
  bannerDisplayHeaderAvatarsSubtitle: {
    id:
      'app.containers.AdminPage.SettingsPage.bannerDisplayHeaderAvatarsSubtitle',
    defaultMessage:
      'Show profile pictures of participants and number of them to non-registered visitors',
  },
  noLogo: {
    id: 'app.containers.AdminPage.SettingsPage.noLogo',
    defaultMessage: 'Please upload a logo',
  },
  noHeader: {
    id: 'app.containers.AdminPage.SettingsPage.noHeader',
    defaultMessage: 'Please upload a header image',
  },
  homePageCustomizableSection: {
    id: 'app.components.AdminPage.SettingsPage.homePageCustomizableSection',
    defaultMessage: 'Homepage customizable section',
  },
  eventsSection: {
    id: 'app.components.AdminPage.SettingsPage.eventsSection',
    defaultMessage: 'Events',
  },
  eventsPageSetting: {
    id: 'app.components.AdminPage.SettingsPage.eventsPageSetting',
    defaultMessage: 'Add Events to navigation bar',
  },
  eventsPageSettingDescription: {
    id: 'app.components.AdminPage.SettingsPage.eventsPageSettingDescription',
    defaultMessage:
      'Add a link to view all project events in the navigation bar',
  },
  allInputSection: {
    id: 'app.components.AdminPage.SettingsPage.allInputSection',
    defaultMessage: 'All input',
  },
  allInputPageSetting: {
    id: 'app.components.AdminPage.SettingsPage.allInputPageSetting',
    defaultMessage: 'Add All input to navigation bar',
  },
  allInputPageSettingDescription: {
    id: 'app.components.AdminPage.SettingsPage.allInputPageDescription',
    defaultMessage: 'Add a link to view all input to the navigation bar',
  },
  customSectionLabel: {
    id: 'app.components.AdminPage.SettingsPage.customSectionLabel',
    defaultMessage: 'Content',
  },
  homePageCustomizableSectionTooltip: {
    id:
      'app.components.AdminPage.SettingsPage.homePageCustomizableSectionTooltip',
    defaultMessage:
      'This empty section at the bottom of the homepage can be customized with your own images, text and links.',
  },
  contrastRatioTooLow: {
    id: 'app.components.AdminPage.SettingsPage.contrastRatioTooLow',
    defaultMessage:
      "The color you selected doesn't have a high enough contrast (to a white background) to comply with the {wcagLink} accessibility standard. {lineBreak} {lineBreak} Not meeting this ratio may impair the user experience of users with visual disabilities, or even make it impossible to use the platform altogether. {lineBreak} {lineBreak} A ratio of at least 4.5 to 1 is needed to comply. Current ratio: {contrastRatio} to 1. Choose a darker color to increase the ratio.",
  },
  bannerHeaderSignedIn: {
    id: 'app.components.AdminPage.SettingsPage.bannerHeaderSignedIn',
    defaultMessage: 'Header text for registered users',
  },
  projects_header: {
    id: 'app.containers.AdminPage.SettingsPage.projects_header',
    defaultMessage: 'Projects header',
  },
  brandingTitle: {
    id: 'app.containers.AdminPage.SettingsPage.brandingTitle',
    defaultMessage: 'Platform branding',
  },
  brandingDescription: {
    id: 'app.containers.AdminPage.SettingsPage.brandingDescription',
    defaultMessage: 'Add your logo and set the platform colors.',
  },
  colorsTitle: {
    id: 'app.containers.AdminPage.SettingsPage.colorsTitle',
    defaultMessage: 'Colors',
  },
  headerDescription: {
    id: 'app.containers.AdminPage.SettingsPage.headerDescription',
    defaultMessage: 'Customise the homepage banner image and text.',
  },
  homePageCustomizableDescription: {
    id: 'app.containers.AdminPage.SettingsPage.homePageCustomizableDescription',
    defaultMessage:
      'Add your own content to the customizable section at the bottom of the homepage.',
  },
  bannerTextTitle: {
    id: 'app.containers.AdminPage.SettingsPage.bannerTextTitle',
    defaultMessage: 'Banner text',
  },
  avatarsTitle: {
    id: 'app.containers.AdminPage.SettingsPage.avatarsTitle',
    defaultMessage: 'Avatars',
  },
  projectsHeaderDescription: {
    id: 'app.containers.AdminPage.SettingsPage.projectsHeaderDescription',
    defaultMessage: 'This text is shown on the homepage above the projects.',
  },
});
