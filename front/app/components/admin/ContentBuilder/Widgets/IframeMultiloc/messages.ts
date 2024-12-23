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
  embedIframeHeightLabel: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedIframeHeightLabel',
    defaultMessage: 'Embed height (pixels)',
  },
  embedIframeHeightLabelTooltip: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.embedIframeHeightLabelTooltip',
    defaultMessage:
      'Height you want your embedded content to appear on the page (in pixels).',
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
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.iframeDescription2',
    defaultMessage:
      'Display content from an external website on your page in an HTML iFrame. Note that not every page can be embedded. If you are having trouble embedding a page, check with the website owner if their server is configured correctly to be embedded.',
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
  iframeSupportLink: {
    id: 'app.containers.admin.ContentBuilder.IframeMultiloc.iframeSupportLink',
    defaultMessage:
      'https://support.citizenlab.co/en/articles/6354058-embedding-elements-in-the-content-builder-to-enrich-project-descriptions',
  },
});
