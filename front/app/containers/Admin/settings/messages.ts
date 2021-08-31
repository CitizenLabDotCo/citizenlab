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
  subtitleHomepageStyle: {
    id: 'app.containers.AdminPage.SettingsPage.subtitleHomepageStyle',
    defaultMessage:
      'Add your logo, set the platform colors, customize the homepage banner and text, and add your own content to the customizable section at the bottom of the homepage.',
  },
  titleHomepageStyle: {
    id: 'app.containers.AdminPage.SettingsPage.titleHomepageStyle',
    defaultMessage: 'Homepage and style',
  },
  tabPages: {
    id: 'app.containers.AdminPage.SettingsPage.tabPages',
    defaultMessage: 'Pages',
  },
  tabRegistration: {
    id: 'app.containers.AdminPage.SettingsPage.tabRegistration',
    defaultMessage: 'Registration',
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
  imageOverlayColor: {
    id: 'app.containers.AdminPage.SettingsPage.imageOverlayColor',
    defaultMessage: 'Image overlay color',
  },
  imageOverlayOpacity: {
    id: 'app.containers.AdminPage.SettingsPage.imageOverlayOpacity',
    defaultMessage: 'Image overlay opacity',
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
  titlePlatformBranding: {
    id: 'app.containers.AdminPage.SettingsPage.titlePlatformBranding',
    defaultMessage: 'Platform branding',
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
  registrationTitle: {
    id: 'app.containers.AdminPage.SettingsPage.registrationTitle',
    defaultMessage: 'Registration',
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
  eventsWidgetSetting: {
    id: 'app.components.AdminPage.SettingsPage.eventsWidgetSetting',
    defaultMessage: 'Add upcoming events to homepage',
  },
  eventsWidgetSettingDescription: {
    id: 'app.components.AdminPage.SettingsPage.eventsWidgetSettingDescription',
    defaultMessage: 'Display a preview of upcoming events on the homepage',
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
  projects_header_tooltip: {
    id: 'app.containers.AdminPage.SettingsPage.project_headers_tooltip',
    defaultMessage: 'This text is shown on the homepage above the projects.',
  },
  signupFormText: {
    id: 'app.containers.AdminPage.SettingsPage.signupFormText',
    defaultMessage: 'Registration helper text',
  },
  signupFormTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.signupFormTooltip',
    defaultMessage: 'Add a short description at the top of the sign-up form.',
  },
  step1: {
    id: 'app.containers.AdminPage.SettingsPage.step1',
    defaultMessage: 'Step 1 (email and password)',
  },
  step1Tooltip: {
    id: 'app.containers.AdminPage.SettingsPage.step1Tooltip',
    defaultMessage:
      'This is shown on the top of the first page of the sign-up form (name, email, password).',
  },
  platformConfiguration: {
    id: 'app.containers.AdminPage.SettingsPage.platformConfiguration',
    defaultMessage: 'Platform configuration',
  },
  contentModeration: {
    id: 'app.containers.AdminPage.SettingsPage.contentModeration',
    defaultMessage: 'Content moderation',
  },
  registrationTabDescription: {
    id: 'app.containers.AdminPage.SettingsPage.registrationTabDescription',
    defaultMessage:
      'Provide a short description at the top of your registration form. Add and configure the registration fields for your platform.',
  },
  profanityBlockerSetting: {
    id: 'app.containers.AdminPage.SettingsPage.profanityBlockerSetting',
    defaultMessage: 'Profanity blocker',
  },
  profanityBlockerSettingDescription: {
    id:
      'app.containers.AdminPage.SettingsPage.profanityBlockerSettingDescription',
    defaultMessage:
      'Block input, proposals and comments containing the most commonly reported offensive words',
  },
  successfulUpdateSettings: {
    id: 'app.containers.AdminPage.SettingsPage.successfulUpdateSettings',
    defaultMessage: 'Settings updated successfully.',
  },
  settingsSavingError: {
    id: 'app.containers.AdminPage.SettingsPage.settingsSavingError',
    defaultMessage: "Couldn't save. Try changing the setting again.",
  },
});
