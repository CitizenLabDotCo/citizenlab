import { defineMessages } from 'react-intl';

export default defineMessages({
  platformAccessTitle: {
    id: 'app.containers.AdminPage.SettingsPage.registration.VisitingPermission.platformAccessTitle',
    defaultMessage: 'Platform access and personal info collection',
  },
  subtitle1: {
    id: 'app.containers.AdminPage.SettingsPage.visitingPermission.subtitle1',
    defaultMessage:
      'Manage who can access the platform. Configuring settings here will do two things:',
  },
  subtitleBullet1: {
    id: 'app.containers.AdminPage.SettingsPage.visitingPermission.subtitleBullet1',
    defaultMessage:
      'The setting will be applied to the global sign-up process (e.g. when people click "Sign up" on the homepage).',
  },
  subtitleBullet2: {
    id: 'app.containers.AdminPage.SettingsPage.visitingPermission.subtitleBullet4',
    defaultMessage:
      'The setting will be applied <b>by default</b> when people want to engage with a project or sign up for an event. Depending on your license, however, <b>admins and managers can override this per phase</b>- see the “Phase access and user data” tab on each project phase.',
  },
});
