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
  contrastRatioTooLow: {
    id: 'app.components.AdminPage.SettingsPage.contrastRatioTooLow',
    defaultMessage:
      "The color you selected doesn't have a high enough contrast (to a white background) to comply with the {wcagLink} accessibility standard. {lineBreak} {lineBreak} Not meeting this ratio may impair the user experience of users with visual disabilities, or even make it impossible to use the platform altogether. {lineBreak} {lineBreak} A ratio of at least 4.5 to 1 is needed to comply. Current ratio: {contrastRatio} to 1. Choose a darker color to increase the ratio.",
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

  homePageCustomizableDescription: {
    id: 'app.containers.AdminPage.SettingsPage.homePageCustomizableDescription',
    defaultMessage:
      'Add your own content to the customizable section at the bottom of the homepage.',
  },
  projectsHeaderDescription: {
    id: 'app.containers.AdminPage.SettingsPage.projectsHeaderDescription',
    defaultMessage: 'This text is shown on the homepage above the projects.',
  },
});
