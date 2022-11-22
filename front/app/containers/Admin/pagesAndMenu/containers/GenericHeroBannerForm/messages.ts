import { defineMessages } from 'react-intl';

// moved from admin/settings/customize

export default defineMessages({
  homepageMetaTitle: {
    id: 'app.containers.AdminPage.SettingsPage.homepageMetaTitle',
    defaultMessage: 'Homepage header | {orgName}',
  },
  customPageMetaTitle: {
    id: 'app.containers.AdminPage.SettingsPage.customPageMetaTitle',
    defaultMessage: 'Custom page header | {orgName}',
  },
  header: {
    id: 'app.containers.AdminPage.SettingsPage.header',
    defaultMessage: 'Homepage header',
  },
  header_bg: {
    id: 'app.containers.AdminPage.SettingsPage.header_bg',
    defaultMessage: 'Header image',
  },
  bannerHeaderSignedOut: {
    id: 'app.containers.AdminPage.SettingsPage.bannerHeaderSignedOut',
    defaultMessage: 'Header text for non-registered visitors',
  },
  bannerHeader: {
    id: 'app.containers.AdminPage.SettingsPage.bannerHeader',
    defaultMessage: 'Header text',
  },
  bannerHeaderSubtitle: {
    id: 'app.containers.AdminPage.SettingsPage.bannerHeaderSubtitle',
    defaultMessage: 'Sub-header text',
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
    id: 'app.containers.AdminPage.SettingsPage.bannerDisplayHeaderAvatarsSubtitle',
    defaultMessage:
      'Show profile pictures of participants and number of them to non-registered visitors',
  },
  bannerHeaderSignedIn: {
    id: 'app.components.AdminPage.SettingsPage.bannerHeaderSignedIn',
    defaultMessage: 'Header text for registered users',
  },
  headerDescription: {
    id: 'app.containers.AdminPage.SettingsPage.headerDescription',
    defaultMessage: 'Customise the homepage banner image and text.',
  },
  bannerTextTitle: {
    id: 'app.containers.AdminPage.SettingsPage.bannerTextTitle',
    defaultMessage: 'Banner text',
  },
  avatarsTitle: {
    id: 'app.containers.AdminPage.SettingsPage.avatarsTitle',
    defaultMessage: 'Avatars',
  },
  imageOverlayColor: {
    id: 'app.containers.AdminPage.SettingsPage.imageOverlayColor',
    defaultMessage: 'Image overlay color',
  },
  imageOverlayOpacity: {
    id: 'app.containers.AdminPage.SettingsPage.imageOverlayOpacity',
    defaultMessage: 'Image overlay opacity',
  },
  bgHeaderPreviewSelectLabel: {
    id: 'app.containers.AdminPage.SettingsPage.bgHeaderPreviewSelectLabel',
    defaultMessage: 'Show preview for',
  },
  desktop: {
    id: 'app.containers.AdminPage.SettingsPage.desktop',
    defaultMessage: 'Desktop',
  },
  tablet: {
    id: 'app.containers.AdminPage.SettingsPage.tablet',
    defaultMessage: 'Tablet',
  },
  phone: {
    id: 'app.containers.AdminPage.SettingsPage.phone',
    defaultMessage: 'Phone',
  },
  headerBgTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.headerBgTooltip',
    defaultMessage:
      'For more information on recommended image resolutions, {supportPageLink}.',
  },
  headerImageSupportPageURL: {
    id: 'app.containers.AdminPage.SettingsPage.headerImageSupportPageURL',
    defaultMessage:
      'https://support.citizenlab.co/en/articles/1346397-what-are-the-recommended-dimensions-and-sizes-of-the-platform-images',
  },
  headerImageSupportPageText: {
    id: 'app.containers.AdminPage.SettingsPage.headerImageSupportPageText',
    defaultMessage: 'visit our support center',
  },
  noHeader: {
    id: 'app.containers.AdminPage.SettingsPage.noHeader',
    defaultMessage: 'Please upload a header image',
  },
  chooseLayout: {
    id: 'app.containers.AdminPage.SettingsPage.chooseLayout',
    defaultMessage: 'Layout',
  },
  fullWidthBannerLayout: {
    id: 'app.containers.AdminPage.SettingsPage.fullWidthBannerLayout',
    defaultMessage: 'Full-width banner',
  },
  TwoColumnLayout: {
    id: 'app.containers.AdminPage.SettingsPage.TwoColumnLayout',
    defaultMessage: 'Two columns',
  },
  twoRowLayout: {
    id: 'app.containers.AdminPage.SettingsPage.twoRowLayout',
    defaultMessage: 'Two rows',
  },
  heroBannerTitle: {
    id: 'app.containers.AdminPage.HeroBannerForm.heroBannerTitle',
    defaultMessage: 'Hero banner',
  },
  saveHeroBanner: {
    id: 'app.containers.AdminPage.HeroBannerForm.saveHeroBanner',
    defaultMessage: 'Save hero banner',
  },
  heroBannerInfoBar: {
    id: 'app.containers.AdminPage.HeroBannerForm.heroBannerInfoBar',
    defaultMessage: 'Customise the hero banner image and text.',
  },
  heroBannerSaveButton: {
    id: 'app.containers.Admin.PagesAndMenu.heroBannerSaveButton',
    defaultMessage: 'Save hero banner',
  },
  heroBannerButtonSuccess: {
    id: 'app.containers.Admin.PagesAndMenu.heroBannerButtonSuccess',
    defaultMessage: 'Success',
  },
  heroBannerMessageSuccess: {
    id: 'app.containers.Admin.PagesAndMenu.heroBannerMessageSuccess',
    defaultMessage: 'Hero banner saved',
  },
  heroBannerError: {
    id: 'app.containers.Admin.PagesAndMenu.heroBannerError',
    defaultMessage: "Couldn't save hero banner",
  },
  saveAndEnable: {
    id: 'app.containers.Admin.PagesAndMenu.saveAndEnableHeroBanner',
    defaultMessage: 'Save and enable hero banner',
  },
});
