/*
 * AdminPage.ideasDashboard Messages
 *
 * This contains all the text for the AdminPage.ideasDashboard component.
 */

import { defineMessages } from 'react-intl';

export default defineMessages({
  helmetTitle: {
    id: 'app.containers.AdminPage.ideasDashboard.helmetTitle',
    defaultMessage: 'Admin ideas page',
  },
  helmetDescription: {
    id: 'app.containers.AdminPage.ideasDashboard.helmetDescription',
    defaultMessage: 'Admin ideas page',
  },
  pageTitle: {
    id: 'app.containers.AdminPage.ideasDashboard.pageTitle',
    defaultMessage: 'Ideas',
  },
  tabSettings: {
    id: 'app.containers.AdminPage.ideasDashboard.tabSettings',
    defaultMessage: 'General',
  },
  subtitleBasic: {
    id: 'app.containers.AdminPage.ideasDashboard.subtitleBasic',
    defaultMessage:
      'Add the name of your organisation or city, a url to your website and the languages in which this platform should be made available.',
  },
  tabCustomize: {
    id: 'app.containers.AdminPage.ideasDashboard.tabCustomizeStatuses',
    defaultMessage: 'Customize Statuses',
  },
  subtitleCustomize: {
    id: 'app.containers.AdminPage.ideasDashboard.subtitleCustomize',
    defaultMessage:
      'Define how your homepage looks like and pick the colour for the action buttons.',
  },
  titleCustomize: {
    id: 'app.containers.AdminPage.ideasDashboard.titleCustomize',
    defaultMessage: 'Customize your platform',
  },
  tabPages: {
    id: 'app.containers.AdminPage.ideasDashboard.tabPages',
    defaultMessage: 'Pages',
  },
  tabRegistration: {
    id: 'app.containers.AdminPage.ideasDashboard.tabRegistration',
    defaultMessage: 'Registration',
  },
  tabTopics: {
    id: 'app.containers.AdminPage.ideasDashboard.tabTopics',
    defaultMessage: 'Topic manager',
  },
  tabWidgets: {
    id: 'app.containers.AdminPage.ideasDashboard.tabWidgets',
    defaultMessage: 'Widgets',
  },
  organizationName: {
    id: 'app.containers.AdminPage.ideasDashboard.organizationName',
    defaultMessage: '{type, select, generic {Organization} other {City}} name',
  },
  languages: {
    id: 'app.containers.AdminPage.ideasDashboard.languages',
    defaultMessage: 'Languages',
  },
  languagesTooltip: {
    id: 'app.containers.AdminPage.ideasDashboard.languagesTooltip',
    defaultMessage:
      'Select the languages in which your platform is made available to users. They can easily choose their preferred language from this list via a button in the navbar.',
  },
  color_main: {
    id: 'app.containers.AdminPage.ideasDashboard.color_main',
    defaultMessage: 'Main color',
  },
  color_secondary: {
    id: 'app.containers.AdminPage.ideasDashboard.color_secondary',
    defaultMessage: 'Secondary color',
  },
  color_text: {
    id: 'app.containers.AdminPage.ideasDashboard.color_text',
    defaultMessage: 'Text color',
  },
  headerOverlayColor: {
    id: 'app.containers.AdminPage.ideasDashboard.headerOverlayColor',
    defaultMessage: 'Header overlay color',
  },
  headerOverlayOpacity: {
    id: 'app.containers.AdminPage.ideasDashboard.headerOverlayOpacity',
    defaultMessage: 'Header overlay opacity',
  },
  logo: {
    id: 'app.containers.AdminPage.ideasDashboard.logo',
    defaultMessage: 'Logo',
  },
  header: {
    id: 'app.containers.AdminPage.ideasDashboard.header',
    defaultMessage: 'Homepage header',
  },
  header_bg: {
    id: 'app.containers.AdminPage.ideasDashboard.header_bg',
    defaultMessage: 'Header image',
  },
  header_bgTooltip: {
    id: 'app.containers.AdminPage.ideasDashboard.header_bgTooltip',
    defaultMessage:
      'Shown on the home page. Recommended dimensions are 1440x480.',
  },
  headerSubtitle: {
    id: 'app.containers.AdminPage.ideasDashboard.titleBasic',
    defaultMessage: 'Basic information',
  },
  titleBasic: {
    id: 'app.containers.AdminPage.ideasDashboard.titleBasic',
    defaultMessage: 'Basic information',
  },
  titleBranding: {
    id: 'app.containers.AdminPage.ideasDashboard.titleBranding',
    defaultMessage: 'Branding',
  },
  headerTitleLabel: {
    id: 'app.containers.AdminPage.ideasDashboard.headerTitleLabel',
    defaultMessage: 'Header title',
  },
  headerTitleTooltip: {
    id: 'app.containers.AdminPage.ideasDashboard.headerTitleTooltip',
    defaultMessage:
      'Shown on the header image on the home page. Tell your users what this platform is about.',
  },
  titleMaxCharError: {
    id: 'app.containers.AdminPage.ideasDashboard.titleMaxCharError',
    defaultMessage:
      'The provided title exceeds the maximum allowed character limit',
  },
  headerSubtitleLabel: {
    id: 'app.containers.AdminPage.ideasDashboard.headerSubtitleLabel',
    defaultMessage: 'Header subtitle',
  },
  headerSubtitleTooltip: {
    id: 'app.containers.AdminPage.ideasDashboard.headerSubtitleTooltip',
    defaultMessage:
      'Shown below the header title on the home page. Tell your users why they should register on your platform.',
  },
  subtitleMaxCharError: {
    id: 'app.containers.AdminPage.ideasDashboard.subtitleMaxCharError',
    defaultMessage:
      'The provided subtitle exceeds the maximum allowed character limit',
  },
  noLogo: {
    id: 'app.containers.AdminPage.ideasDashboard.noLogo',
    defaultMessage: 'Please upload a logo',
  },
  noHeader: {
    id: 'app.containers.AdminPage.ideasDashboard.noHeader',
    defaultMessage: 'Please upload a header image',
  },
  save: {
    id: 'app.containers.AdminPage.ideasDashboard.save',
    defaultMessage: 'Save',
  },
  saveSuccess: {
    id: 'app.containers.AdminPage.ideasDashboard.saveSuccess',
    defaultMessage: 'Success!',
  },
  saveErrorMessage: {
    id: 'app.containers.AdminPage.ideasDashboard.saveErrorMessage',
    defaultMessage: 'Something went wrong, please try again later.',
  },
  saveSuccessMessage: {
    id: 'app.containers.AdminPage.ideasDashboard.saveSuccessMessage',
    defaultMessage: 'Your changes have been saved.',
  },
  titleRegistrationFields: {
    id: 'app.containers.AdminPage.ideasDashboard.titleRegistrationFields',
    defaultMessage: 'Registration fields',
  },
  subtitleRegistrationFields: {
    id: 'app.containers.AdminPage.ideasDashboard.subtitleRegistrationFields',
    defaultMessage:
      'Define what specific information you want to ask people while creating an account. Use this information to create Smart Groups and give particular user groups access to certain projects.',
  },
  tabAreas: {
    id: 'app.containers.AdminPage.ideasDashboard.tabAreas',
    defaultMessage: 'Areas',
  },
  urlError: {
    id: 'app.containers.AdminPage.ideasDashboard.urlError',
    defaultMessage: 'The URL needs to start with "http://" or "https://".',
  },
  urlTitle: {
    id: 'app.containers.AdminPage.ideasDashboard.urlTitle',
    defaultMessage: 'Website (URL)',
  },
  urlTitleTooltip: {
    id: 'app.containers.AdminPage.ideasDashboard.urlTitleTooltip',
    defaultMessage:
      'Add the URL of the website you want to link this platform with. Used in the footer on the home page.',
  },
  homePageCustomSection: {
    id: 'app.components.AdminPage.ideasDashboard.homePageCustomSection',
    defaultMessage: 'Home page custom section',
  },
  customSectionLabel: {
    id: 'app.components.AdminPage.ideasDashboard.customSectionLabel',
    defaultMessage: 'Content',
  },
  customSectionInfo: {
    id: 'app.components.AdminPage.ideasDashboard.customSectionInfo',
    defaultMessage:
      "The content of this field will be shown at the bottom of the platform's home page, visible to all visitors.",
  },
  contrastRatioTooLow: {
    id: 'app.components.AdminPage.ideasDashboard.contrastRatioTooLow',
    defaultMessage:
      "The color you selected doesn't have a high enough contrast (to a white background) to comply with the {wcagLink} accessibility standard. {lineBreak} {lineBreak} Not meeting this ratio may impair the user experience of users with visual disabilities, or even make it impossible to use the platform altogether. {lineBreak} {lineBreak} A ratio of at least 4.5 to 1 is needed to comply. Current ratio: {contrastRatio} to 1. Choose a darker color to increase the ratio.",
  },
  required: {
    id: 'app.containers.AdminPage.ideasDashboard.required',
    defaultMessage: 'Required',
  },
  deleteButtonLabel: {
    id: 'app.containers.AdminPage.ideasDashboard.delete',
    defaultMessage: 'Delete',
  },
  editButtonLabel: {
    id: 'app.containers.AdminPage.ideasDashboard.manage',
    defaultMessage: 'Manage',
  },
  systemField: {
    id: 'app.containers.AdminPage.ideasDashboard.default',
    defaultMessage: 'Default',
  },
  addIdeaStatus: {
    id: 'app.containers.AdminPage.ideasDashboard.addStatus',
    defaultMessage: 'Add Status',
  },
  titleIdeaStatuses: {
    id: 'app.containers.AdminPage.ideasDashboard.titleIdeaStatuses',
    defaultMessage: 'Customize Statuses',
  },
  subtitleIdeaStatuses: {
    id: 'app.containers.AdminPage.ideasDashboard.subtitleIdeaStatuses',
    defaultMessage: "Define the lifecycle statuses of your citizen's ideas.",
  },
});
