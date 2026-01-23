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
  fullWidthBannerTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.fullWidthBannerTooltip',
    defaultMessage:
      'This banner stretches over the full width for a great visual effect. The image will try to cover as much space as possible, causing it to not always be visible at all times. You can combine this banner with an overlay of any colour. More info on the recommended image usage can be found on our { link }.',
  },
  fullWidthBannerTooltipLink: {
    id: 'app.containers.AdminPage.SettingsPage.fullWidthBannerTooltipLink',
    defaultMessage: 'knowledge base',
  },
  TwoColumnLayout: {
    id: 'app.containers.AdminPage.SettingsPage.TwoColumnLayout',
    defaultMessage: 'Two columns',
  },
  twoRowLayout: {
    id: 'app.containers.AdminPage.SettingsPage.twoRowLayout',
    defaultMessage: 'Two rows',
  },
  twoRowBannerTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.twoRowBannerTooltip',
    defaultMessage:
      'This banner is in particular useful which images that don’t work well with text from the title, subtitle or button. These items will be pushed below the banner. More info on the recommended image usage can be found on our { link }.',
  },
  twoRowBannerTooltipLink: {
    id: 'app.containers.AdminPage.SettingsPage.twoRowBannerTooltipLink',
    defaultMessage: 'knowledge base',
  },
  fixedRatioLayout: {
    id: 'app.containers.AdminPage.SettingsPage.fixedRatio',
    defaultMessage: 'Fixed-ratio banner',
  },
  fixedRatioBannerTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.fixedRatioBannerTooltip',
    defaultMessage:
      'This banner type works best with images that shouldn’t be cropped, such as images with text, a logo or specific elements that are crucial to your citizens. This banner is replaced with a solid box in the primary colour when users are signed in. You can set this colour in the general settings. More info on the recommended image usage can be found on our { link }.',
  },
  fixedRatioBannerTooltipLink: {
    id: 'app.containers.AdminPage.SettingsPage.fixedRatioBannerTooltipLink',
    defaultMessage: 'knowledge base',
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
  ctaHeader: {
    id: 'app.containers.AdminPage.SettingsPage.ctaHeader',
    defaultMessage: 'Buttons',
  },
  signed_out: {
    id: 'app.containers.AdminPage.SettingsPage.signed_out',
    defaultMessage: 'Button for non-registered visitors',
  },
  signed_in: {
    id: 'app.containers.AdminPage.SettingsPage.signed_in',
    defaultMessage: 'Button for registered visitors',
  },
  overlayToggleLabel: {
    id: 'app.containers.AdminPage.SettingsPage.overlayToggleLabel',
    defaultMessage: 'Enable overlay',
  },
  imageSupportPageURL2: {
    id: 'app.containers.AdminPage.SettingsPage.imageSupportPageURL2',
    defaultMessage:
      'https://support.govocal.com/en/articles/527652-what-are-the-recommended-dimensions-and-sizes-of-the-platform-images',
  },
});
