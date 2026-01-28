import { defineMessages } from 'react-intl';

export default defineMessages({
  url: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.url',
    defaultMessage: 'Embed',
  },
  embedIframeUrlLabel: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedIframeUrlLabel',
    defaultMessage: 'Website address',
  },
  embedIframeUrlLabelTooltip: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedIframeUrlLabelTooltip',
    defaultMessage: 'Full URL of the website you want to embed.',
  },
  embedModeLabel: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedModeLabel',
    defaultMessage: 'Embed mode',
  },
  embedModeFixedHeight: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedModeFixedHeight',
    defaultMessage: 'Fixed Height',
  },
  embedModeAspectRatio: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedModeAspectRatio',
    defaultMessage: 'Aspect Ratio',
  },
  embedModeTooltip: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedModeTooltip',
    defaultMessage:
      'Choose between fixed heights for different devices or responsive aspect ratios.',
  },
  embedDesktopIframeHeightLabel: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedDesktopIframeHeightLabel',
    defaultMessage: 'Desktop height (pixels)',
  },
  embedDesktopIframeHeightLabelTooltip: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedDesktopIframeHeightLabelTooltip',
    defaultMessage: 'Height for desktop view (in pixels).',
  },
  embedTabletHeightLabel: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedTabletHeightLabel',
    defaultMessage: 'Tablet height (pixels)',
  },
  embedTabletHeightTooltip: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedTabletHeightTooltip1',
    defaultMessage:
      'Height for tablet view (in pixels). Will fall back to desktop height if not set.',
  },
  embedMobileHeightLabel: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedMobileHeightLabel',
    defaultMessage: 'Mobile height (pixels)',
  },
  embedMobileHeightTooltip: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedMobileHeightTooltip1',
    defaultMessage:
      'Height for mobile view (in pixels). Will fall back to desktop height if not set.',
  },
  embedAspectRatioLabel: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedAspectRatioLabel',
    defaultMessage: 'Aspect ratio',
  },
  embedAspectRatioTooltip: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedAspectRatioTooltip',
    defaultMessage:
      'Choose an aspect ratio that scales responsively across all devices.',
  },
  embedAspectRatio169: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedAspectRatio169',
    defaultMessage: '16:9',
  },
  embedAspectRatio43: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedAspectRatio43',
    defaultMessage: '4:3',
  },
  embedAspectRatio34: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedAspectRatio34',
    defaultMessage: '3:4',
  },
  embedAspectRatio11: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedAspectRatio11',
    defaultMessage: '1:1',
  },
  embedAspectRatioCustom: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedAspectRatioCustom',
    defaultMessage: 'Custom',
  },
  embedCustomAspectRatioLabel: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedCustomAspectRatioLabel',
    defaultMessage: 'Custom aspect ratio',
  },
  embedCustomAspectRatioTooltip: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedCustomAspectRatioTooltip',
    defaultMessage:
      'Enter width:height ratio (e.g., 5:3, 16:10, 21:9). Common ratios: 5:3 (1.67:1), 16:10 (1.6:1), 21:9 (2.33:1).',
  },
  iframeHeightPlaceholder: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.iframeHeightPlaceholder',
    defaultMessage: '300',
  },
  embedIframeTitleLabel: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedIframeTitleLabel',
    defaultMessage: 'Short description of the content you are embedding',
  },
  embedIframeTitleTooltip: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedIframeTitleTooltip',
    defaultMessage:
      'It is useful to provide this information for users who rely on a screen reader or other assistive technology.',
  },
  iframeInvalidUrlErrorMessage: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.iframeUrlErrorMessage',
    defaultMessage:
      'Enter a valid web address, for example https://example.com',
  },
  iframeDescription: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.iframeDescription3',
    defaultMessage:
      'Display content from an external website on your page in an HTML iFrame. Note that not every page can be embedded. If you are having trouble embedding a page, check with the owner of the page if it is configured to allow embedding.',
  },
  iframeInvalidWhitelistUrlErrorMessage: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.iframeInvalidWhitelistUrlErrorMessage',
    defaultMessage:
      'Sorry, this content could not be embedded. {visitLinkMessage} to learn more.',
  },
  iframeEmbedVisitLinkMessage: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.iframeEmbedVisitLinkMessage',
    defaultMessage: 'Visit our support page',
  },
  iframeSupportLink2: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.iframeSupportLink2',
    defaultMessage:
      'https://support.govocal.com/en/articles/527598-embedding-elements-in-the-content-builder-to-enrich-project-descriptions',
  },
  invalidAspectRatio: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.invalidAspectRatio',
    defaultMessage: 'Enter a valid aspect ratio, for example 16:10 or 5:3.',
  },
});
