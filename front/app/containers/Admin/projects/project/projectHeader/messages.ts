import { defineMessages } from 'react-intl';

export default defineMessages({
  view: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.view',
    defaultMessage: 'View',
  },
  share: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.share',
    defaultMessage: 'Share',
  },
  shareTitle: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.shareTitle',
    defaultMessage: 'Share this project',
  },
  shareLink: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.shareLink',
    defaultMessage: 'Copy link',
  },
  shareLinkCopied: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.shareLinkCopied',
    defaultMessage: 'Link copied',
  },
  shareWhoHasAccess: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.shareWhoHasAccess',
    defaultMessage: 'Who has access',
  },
  anyoneWithLink: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.anyoneWithLink',
    defaultMessage: 'Anyone with the link can interact with the draft project',
  },
  participants: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.participants',
    defaultMessage:
      '{participantsCount, plural, one {1 participant} other {{participantsCount} participants}}',
  },
  offlineVoters: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.offlineVoters',
    defaultMessage: 'Offline voters',
  },
  everyone: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.everyone',
    defaultMessage: 'Everyone',
  },
  adminsOnly: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.adminsOnly',
    defaultMessage: 'Admins only',
  },
  groups: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.groups',
    defaultMessage: 'Groups',
  },
  draft: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.draft',
    defaultMessage: 'Draft',
  },
  archived: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.archived',
    defaultMessage: 'Archived',
  },
  publishedActive: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.publishedActive1',
    defaultMessage: 'Published - Active',
  },
  publishedFinished: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.publishedFinished1',
    defaultMessage: 'Published - Finished',
  },
  draftStatus: {
    id: 'app.containers.AdminPage.ProjectEdit.draftStatus',
    defaultMessage: 'Draft',
  },
  draftExplanation: {
    id: 'app.containers.AdminPage.ProjectEdit.dradftExplanationText',
    defaultMessage:
      'Draft projects are hidden for all people except admins and assigned project managers.',
  },
  publishedStatus: {
    id: 'app.containers.AdminPage.ProjectEdit.publishedStatus',
    defaultMessage: 'Published',
  },
  publishedExplanation: {
    id: 'app.containers.AdminPage.ProjectEdit.publishedExplanationText',
    defaultMessage:
      'Published projects are visible to everyone or a group subset if selected.',
  },
  archivedStatus: {
    id: 'app.containers.AdminPage.ProjectEdit.archivedStatus',
    defaultMessage: 'Archived',
  },
  archivedExplanation: {
    id: 'app.containers.AdminPage.ProjectEdit.archivedExplanationText',
    defaultMessage:
      'Archived projects are still visible, but do not allow further participation',
  },
  participantsInfoTitle: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.participantsInfo.participantsInfoTitle',
    defaultMessage: 'Participants include:',
  },
  users: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.participantsInfo.users',
    defaultMessage: 'Users interacting with Go Vocal methods',
  },
  registrants: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.participantsInfo.registrants',
    defaultMessage: 'Event registrants',
  },
  participantsExclusionTitle: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.participantsInfo.participantsExclusionTitle2',
    defaultMessage: 'Participants <b>do not include</b>:',
  },
  followers: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.participantsInfo.followers',
    defaultMessage: 'Followers of a project',
  },
  embeddedMethods: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.participantsInfo.embeddedMethods',
    defaultMessage: 'Participants in embedded methods (e.g., external surveys)',
  },
  note: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.participantsInfo.note',
    defaultMessage:
      'Note: Enabling anonymous or open participation permissions may allow users to participate multiple times, leading to misleading or incomplete user data.',
  },
  refreshLink: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.refreshLink',
    defaultMessage: 'Refresh project preview link',
  },
  refreshLinkTooltip: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.refreshLinkTooltip',
    defaultMessage:
      'Regenerate project preview link. This will invalidate the previous link.',
  },
  shareLinkUpsellTooltip: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.shareLinkUpsellTooltip',
    defaultMessage:
      'Sharing private links is not included on your current plan. Talk to your Government Success Manager or admin to unlock it.',
  },
  regenenrateLinkModalTitle: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.regenenrateLinkModalTitle',
    defaultMessage: 'Are you sure? This will disable the current link',
  },
  regenenrateLinkModalDescription: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.regenenrateLinkModalDescription',
    defaultMessage:
      'Old links will stop working but you can generate a new one at any time.',
  },
  regenerateYes: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.regenerateYes',
    defaultMessage: 'Yes, refresh link',
  },
  regenerateNo: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.regenerateNo',
    defaultMessage: 'Cancel',
  },
  approvedBy: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.approvedBy',
    defaultMessage: 'Approved by {name}',
  },
  public: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.public',
    defaultMessage: 'Public',
  },
  hidden: {
    id: 'app.components.app.containers.AdminPage.ProjectEdit.projectHeader.hidden',
    defaultMessage: 'Hidden',
  },
});
