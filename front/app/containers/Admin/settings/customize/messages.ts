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
  noLogo: {
    id: 'app.containers.AdminPage.SettingsPage.noLogo',
    defaultMessage: 'Please upload a logo',
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
});
