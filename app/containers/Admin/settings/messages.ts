/*
 * AdminPage.SettingsPage Messages
 *
 * This contains all the text for the AdminPage.SettingsPage component.
 */

import { defineMessages } from 'react-intl';

export default defineMessages({
  helmetTitle: {
    id: 'app.containers.AdminPage.SettingsPage.helmetTitle',
    defaultMessage: 'Admin settings page',
  },
  helmetDescription: {
    id: 'app.containers.AdminPage.SettingsPage.helmetDescription',
    defaultMessage: 'Admin settings page',
  },
  pageTitle: {
    id: 'app.containers.AdminPage.SettingsPage.pageTitle',
    defaultMessage: 'Settings',
  },
  tabSettings: {
    id: 'app.containers.AdminPage.SettingsPage.tabSettings',
    defaultMessage: 'General',
  },
  subtitleBasic: {
    id: 'app.containers.AdminPage.SettingsPage.subtitleBasic',
    defaultMessage:
      'Add the name of your organisation or city, a url to your website and the languages in which this platform should be made available.',
  },
  tabCustomize: {
    id: 'app.containers.AdminPage.SettingsPage.tabCustomize',
    defaultMessage: 'Customize',
  },
  subtitleCustomize: {
    id: 'app.containers.AdminPage.SettingsPage.subtitleCustomize',
    defaultMessage:
      'Define how your homepage looks like and pick the colour for the action buttons.',
  },
  titleCustomize: {
    id: 'app.containers.AdminPage.SettingsPage.titleCustomize',
    defaultMessage: 'Customize your platform',
  },
  tabPages: {
    id: 'app.containers.AdminPage.SettingsPage.tabPages',
    defaultMessage: 'Pages',
  },
  tabRegistrationFields: {
    id: 'app.containers.AdminPage.SettingsPage.tabRegistrationFields',
    defaultMessage: 'Registration fields',
  },
  tabTopics: {
    id: 'app.containers.AdminPage.SettingsPage.tabTopics',
    defaultMessage: 'Topic manager',
  },
  tabWidgets: {
    id: 'app.containers.AdminPage.SettingsPage.tabWidgets',
    defaultMessage: 'Widgets',
  },
  organizationName: {
    id: 'app.containers.AdminPage.SettingsPage.organizationName',
    defaultMessage: '{type, select, generic {Organization} other {City}} name',
  },
  languages: {
    id: 'app.containers.AdminPage.SettingsPage.languages',
    defaultMessage: 'Languages',
  },
  languagesTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.languagesTooltip',
    defaultMessage:
      'Select the languages in which your platform is made available to users. They can easily choose their preferred language from this list via a button in the navbar.',
  },
  color_main: {
    id: 'app.containers.AdminPage.SettingsPage.color_main',
    defaultMessage: 'Main color',
  },
  color_secondary: {
    id: 'app.containers.AdminPage.SettingsPage.color_secondary',
    defaultMessage: 'Secondary color',
  },
  color_text: {
    id: 'app.containers.AdminPage.SettingsPage.color_text',
    defaultMessage: 'Text color',
  },
  headerOverlayColor: {
    id: 'app.containers.AdminPage.SettingsPage.headerOverlayColor',
    defaultMessage: 'Header overlay color',
  },
  headerOverlayOpacity: {
    id: 'app.containers.AdminPage.SettingsPage.headerOverlayOpacity',
    defaultMessage: 'Header overlay opacity',
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
  titleBasic: {
    id: 'app.containers.AdminPage.SettingsPage.titleBasic',
    defaultMessage: 'Basic information',
  },
  titleBranding: {
    id: 'app.containers.AdminPage.SettingsPage.titleBranding',
    defaultMessage: 'Branding',
  },
  headerTitleLabel: {
    id: 'app.containers.AdminPage.SettingsPage.headerTitleLabel',
    defaultMessage: 'Header title',
  },
  headerTitleTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.headerTitleTooltip',
    defaultMessage:
      'Shown on the header image on the home page. Tell your users what this platform is about.',
  },
  titleMaxCharError: {
    id: 'app.containers.AdminPage.SettingsPage.titleMaxCharError',
    defaultMessage:
      'The provided title exceeds the maximum allowed character limit',
  },
  headerSubtitleLabel: {
    id: 'app.containers.AdminPage.SettingsPage.headerSubtitleLabel',
    defaultMessage: 'Header subtitle',
  },
  headerSubtitleTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.headerSubtitleTooltip',
    defaultMessage:
      'Shown below the header title on the home page. Tell your users why they should register on your platform.',
  },
  subtitleMaxCharError: {
    id: 'app.containers.AdminPage.SettingsPage.subtitleMaxCharError',
    defaultMessage:
      'The provided subtitle exceeds the maximum allowed character limit',
  },
  noLogo: {
    id: 'app.containers.AdminPage.SettingsPage.noLogo',
    defaultMessage: 'Please upload a logo',
  },
  noHeader: {
    id: 'app.containers.AdminPage.SettingsPage.noHeader',
    defaultMessage: 'Please upload a header image',
  },
  save: {
    id: 'app.containers.AdminPage.SettingsPage.save',
    defaultMessage: 'Save',
  },
  saveSuccess: {
    id: 'app.containers.AdminPage.SettingsPage.saveSuccess',
    defaultMessage: 'Success!',
  },
  saveErrorMessage: {
    id: 'app.containers.AdminPage.SettingsPage.saveErrorMessage',
    defaultMessage: 'Something went wrong, please try again later.',
  },
  saveSuccessMessage: {
    id: 'app.containers.AdminPage.SettingsPage.saveSuccessMessage',
    defaultMessage: 'Your changes have been saved.',
  },
  titleRegistration: {
    id: 'app.containers.AdminPage.SettingsPage.titleRegistration',
    defaultMessage: 'Registration fields',
  },
  subtitleRegistration: {
    id: 'app.containers.AdminPage.SettingsPage.subtitleRegistration',
    defaultMessage:
      'Specify what information people are asked to provide when signing up.',
  },
  tabAreas: {
    id: 'app.containers.AdminPage.SettingsPage.tabAreas',
    defaultMessage: 'Areas',
  },
  urlError: {
    id: 'app.containers.AdminPage.SettingsPage.urlError',
    defaultMessage: 'The URL needs to start with "http://" or "https://".',
  },
  urlTitle: {
    id: 'app.containers.AdminPage.SettingsPage.urlTitle',
    defaultMessage: 'Website (URL)',
  },
  urlTitleTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.urlTitleTooltip',
    defaultMessage:
      'Add the URL of the website you want to link this platform with. Used in the footer on the home page.',
  },
  homePageCustomSection: {
    id: 'app.components.AdminPage.SettingsPage.homePageCustomSection',
    defaultMessage: 'Home page custom section',
  },
  customSectionLabel: {
    id: 'app.components.AdminPage.SettingsPage.customSectionLabel',
    defaultMessage: 'Content',
  },
  customSectionInfo: {
    id: 'app.components.AdminPage.SettingsPage.customSectionInfo',
    defaultMessage:
      "The content of this field will be shown at the bottom of the platform's home page, visible to all visitors.",
  },
  contrastRatioTooLow: {
    id: 'app.components.AdminPage.SettingsPage.contrastRatioTooLow',
    defaultMessage:
      "The color you selected doesn't have a high enough contrast (to a white background) to comply with the {wcagLink} accessibility standard. {lineBreak} {lineBreak} Not meeting this ratio may impair the user experience of users with visual disabilities, or even make it impossible to use the platform altogether. {lineBreak} {lineBreak} A ratio of at least 4.5 to 1 is needed to comply. Current ratio: {contrastRatio} to 1. Choose a darker color to increase the ratio.",
  },
  bannerHeaderSignedIn: {
    id: 'app.components.AdminPage.SettingsPage.bannerHeaderSignedIn',
    defaultMessage: 'Banner header (for signed-in users)',
  },
});
