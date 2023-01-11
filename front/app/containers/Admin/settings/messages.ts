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
  tabPolicies: {
    id: 'app.containers.AdminPage.SettingsPage.tabPolicies',
    defaultMessage: 'Policies',
  },
  tabRegistration: {
    id: 'app.containers.AdminPage.SettingsPage.tabRegistration',
    defaultMessage: 'Registration',
  },
  tabTopics: {
    id: 'app.containers.AdminPage.SettingsPage.tabTopics',
    defaultMessage: 'Tag manager',
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
  titleBasic: {
    id: 'app.containers.AdminPage.SettingsPage.titleBasic',
    defaultMessage: 'Basic information',
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
  registrationHelperTextDescription: {
    id: 'app.containers.AdminPage.SettingsPage.registrationHelperTextDescription',
    defaultMessage:
      'Provide a short description at the top of your registration form.',
  },
  profanityBlockerSetting: {
    id: 'app.containers.AdminPage.SettingsPage.profanityBlockerSetting',
    defaultMessage: 'Profanity blocker',
  },
  profanityBlockerSettingDescription: {
    id: 'app.containers.AdminPage.SettingsPage.profanityBlockerSettingDescription',
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
